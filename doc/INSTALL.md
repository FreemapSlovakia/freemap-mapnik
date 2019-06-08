# Installation

## Requirements

- Node.js 10
- PostGIS
- GDAL including python-gdal
- imposm3

## Installing prerequisites

1. Get OpenStreetMap data (eg. from [Geofabrik](http://download.geofabrik.de/))
1. Create a postgis database (see below for details)
1. Import OpenStreetMap data (see below for details)
1. Get digital elevation data and import it to database (optional; see below for details)
1. Change directory to project directory
1. Run `npm i`
1. Create `config/development.json5` where you can override settings from `config/default.json5` for your local environment
1. Run `npm run watch`
1. Open [preview.html](../preview.html) in your browser

## Get sources

Run:

```
git clone https://github.com/FreemapSlovakia/freemap-mapnik.git
cd freemap-mapnik
npm i
```

## Importing OSM data to PostGIS

In following commands replace `<you>` with your username.

### Prepare database

1. `sudo su - postgres` (skip this on MacOS)
1. `createdb <you>`
1. `createuser <you>`
1. `psql <you>`
1. `CREATE EXTENSION postgis;`
1. `CREATE EXTENSION postgis_topology;`
1. `GRANT CREATE ON DATABASE <you> TO <you>;`
1. `ALTER USER <you> WITH PASSWORD '<your_password>';`

### Import OpenStreetMap to database

You must have imposm3 installed. For instructions how to build it see https://github.com/omniscale/imposm3.

To import the data use following command (with correct pbf filename):

```
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -read slovakia-latest.osm.pbf -write
```

Then deploy the import to production:

```
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -deployproduction
```

Import `additional.sql` to Postgresql.

See also [instructions to compute and import peak isolations](./PEAK_ISOLATION.md).

#### Building Imposm on MacOS

```
brew install golang leveldb geos
```

and then execute the commands [here](https://github.com/omniscale/imposm3/#compile)

## Contours and shaded relief (optional)

1. Obtain digital elevation data from [EarthExplorer](https://earthexplorer.usgs.gov/)
   - recommended Data Set is _SRTM 1 Arc-Second Global_
   - use GeoTIFF format; then convert it to HGT or modify `shading/Makefile` ;-)
1. To generate shaded relief and contours run `npm i -g dem-iron shp-polyline-splitter && cd shading && make -j 8`

## Setting up minutely diff applying (working notes)

1. Download `europe-latest.osm.pbf` from Geofabrik
1. Extract area of focus with Osmium:
   ```
   osmium extract -p limit.geojson -s smart -S types=multipolygon,route,boundary europe-latest.osm.pbf -o extract.pbf
   ```
1. Import the extract:
   ```
   ~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -read extract.pbf -diff -write -cachedir ./cache -diffdir ./diff
   ```
1. Deploy the import to production:
   ```
   ~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -deployproduction
   ```
1. Import `additional.sql` to Postgresql
1. Update `./diff/last.state.txt` to reflect timestamp and sequence number of the imported map (I think that for sure the timestamp can be even bit older).
   See https://planet.openstreetmap.org/replication/minute/ for finding sequence number.
1. Delete cached tiles
1. Run minutely diff importing in the background:
   ```
   nohup ~/go/bin/imposm run -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -limitto limit.geojson -cachedir ./cache -diffdir ./diff -expiretiles-zoom 15 -expiretiles-dir ./expires &
   ```

## Nginx as front tier

```
server {
    ...

    location /pdf {
      proxy_pass http://localhost:4000/pdf;
    }

    location / {
      rewrite ^(.*)$ $1.png break;
      root    /home/freemap/freemap-mapnik/tiles/;
      error_page 404 = @fallback;
    }

    location @fallback {
      proxy_pass http://localhost:4000;
      error_page 404 /40x.html;
    }

    ...
}
```

## Notes
Fixing 1201x3601 SRTM (skips `dem-iron`ing):

TODO: integrate to `shading/Makefile`.

```bash
for x in `seq 11 22`; do
  for y in `seq 50 51`; do
    gdalwarp N${y}E0${x}.hgt -multi -r cubicspline \
      -te $((x-1)).99986111 $((y-1)).99986111 $((x+1)).00013889 $((y+1)).00013889 \
      -tr 0.000277777777778 -0.000277777777778 \
      N${y}E0${x}.aa.tiff
  done
done
```
