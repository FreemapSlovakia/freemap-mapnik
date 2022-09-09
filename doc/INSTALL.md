# Installation

## Requirements

- Node.js 12
- PostGIS
- GDAL including python-gdal
- imposm3

## Get sources

Run:

```bash
git clone https://github.com/FreemapSlovakia/freemap-mapnik.git
cd freemap-mapnik
npm i
```

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

## Building

To build sources for production run:

```bash
npm run build
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

```bash
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -read slovakia-latest.osm.pbf -write
```

Then deploy the import to production:

```bash
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -deployproduction
```

Import `additional.sql` to Postgresql.

See also [instructions to compute and import peak isolations](./PEAK_ISOLATION.md).

#### Building Imposm on MacOS

```bash
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
   ```bash
   osmium extract -p limit.geojson -s smart -S types=multipolygon,route,boundary europe-latest.osm.pbf -o extract.pbf
   ```
1. Import the extract:
   ```bash
   ~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -read extract.pbf -diff -write -cachedir ./cache -diffdir ./diff
   ```
1. Deploy the import to production:
   ```bash
   ~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -deployproduction
   ```
1. Import `additional.sql` to Postgresql
1. Update `./diff/last.state.txt` to reflect timestamp and sequence number of the imported map (I think that for sure the timestamp can be even bit older).
   See https://planet.openstreetmap.org/replication/minute/ for finding sequence number.
1. Delete cached tiles
1. Run minutely diff importing in the background:
   ```bash
   nohup ~/go/bin/imposm run -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -limitto limit.geojson -cachedir ./cache -diffdir ./diff -expiretiles-zoom 14 -expiretiles-dir ./expires &
   ```

## Nginx as front tier

```nginx
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

EPSG:3857: +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over

```bash
gdalwarp -overwrite -of GTiff -ot Float32 -co NBITS=16 -co TILED=YES -co PREDICTOR=3 -co COMPRESS=ZSTD -co NUM_THREADS=ALL_CPUS -multi -wo NUM_THREADS=ALL_CPUS -srcnodata -9999 -r cubicspline -order 3 -tr 19.109257071294062687 19.109257071294062687 -tap -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" -s_srs "+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=542.5,89.2,456.9,5.517,2.275,5.516,6.96 +pm=greenwich +units=m +nadgrids=slovak +no_defs" sk.tiff sk_w.tiff

# -s_srs "+proj=krovak +ellps=bessel +nadgrids=slovak"
```

gdal_translate -of AAIGrid square.tif square.asc

Convert HGT to tiff

```bash
for i in *.HGT; do gdalwarp -overwrite -of GTiff -ot Float32 -co "NBITS=16" -co "TILED=YES" -co "PREDICTOR=3" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" -r cubicspline -order 3 -tr 20 20 -multi -dstnodata NaN -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" $i ${i%.HGT}.tiff; done
```

Fill nodata in tiffs

```bash
for i in N*.tiff; do gdal_fillnodata.py -of GTiff -co "NBITS=16" -co "TILED=YES" -co "PREDICTOR=3" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" $i ${i%.tiff}.filled.tiff; done
```

```bash
gdal_merge.py -of GTiff -co "NBITS=16" -co "TILED=YES" -co "PREDICTOR=3" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" -n NaN -a_nodata NaN -o merged.tiff N*.filled.tiff sk_w.tiff
```
