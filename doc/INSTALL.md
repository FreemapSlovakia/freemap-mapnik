# Installation

## Requirements

- Node.js 14+
- PostGIS
- GDAL including python-gdal
- imposm3

## Get sources

```bash
git clone https://github.com/FreemapSlovakia/freemap-mapnik.git
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
npm i
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
1. `GRANT ALL ON SCHEMA public TO <you>;`

### Import OpenStreetMap to database

Import [initial.sql](../sql/initial.sql) to PostgreSQL.

You must have imposm3 installed. For instructions how to build it see https://github.com/omniscale/imposm3.

To import the data use following command (with correct pbf filename):

```bash
imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -read slovakia-latest.osm.pbf -write
```

Then deploy the import to production:

```bash
imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping mapping.yaml -deployproduction
```

Import [additional.sql](../sql/additional.sql) to PostgreSQL.

# Peak isolations

See [instructions to compute and import peak isolations](./PEAK_ISOLATION.md) to prioritize peaks with higher isolation.
Skip this step if you want to omit this functionality.

## Prepare coastlines

From https://osmdata.openstreetmap.de/data/land-polygons.html get `simplified-land-polygons-complete-3857` and `land-polygons-split-3857` and unpack it to project directory.

## Setup imposm and freemap-mapnik services

In order to run both imposm and freemap-mapnik services, you'll find these two ready made files in the [etc/systemd](../etc/systemd/) folder.

- Copy these two files in the relevant directory of your system to allow these services to run independently of any user login, place them into the `/etc/systemd/system` folder.
- Each of these two files must be edited and customized according to the installation folder, the relevant username, the database name and the login/password database account
- Tell the system some things have changed: `sudo systemctl daemon-reload`
- Enable and start imposm:

  ```bash
  systemctl enable imposm3
  systemctl start imposm3
  ```

- Enable freemap-mapnik:

  ```bash
  systemctl enable freemap-mapnik
  systemctl start freemap-mapnik
  ```

Later on in this documentation will you find mentions of two 'versions' of the freemap-mapnik service:

- freemap-mapnik-prerender which is used to pre-render tiles from zoom 1 to zoom 14 (if a tile is missing or OSM data has been changed)
- freemap-mapnik-ondemand which renders tiles when requested by the user (from zoom 15 to 19) and missing.

#### Building Imposm on MacOS

```bash
brew install golang leveldb geos
```

and then execute the commands [here](https://github.com/omniscale/imposm3/#compile)

## Contours and shaded relief

If you don't want to use hillshading and contours then set `mapFeatures.contours` and `mapFeatures.shading` in your config file to `false`.
Otherwise follow instructions in [SHADING_AND_CONTOURS.md](./SHADING_AND_CONTOURS.md).

## Setting up minutely diff applying

Follow these steps also after database reimport, which is required if you've updated `mapping.yaml`:

1. Download `europe-latest.osm.pbf` from Geofabrik
1. Stop imposm service
   ```bash
   systemctl stop imposm3
   ```
1. update and compile freemap-mapnik
   ```bash
   git pull && npm run build
   ```
1. Import:
   ```bash
   imposm import -connection postgis://freemap:freemap@localhost/freemap -mapping mapping.yaml -read europe-latest.osm.pbf -diff -write -cachedir ./cache -diffdir ./diff -overwritecache -limitto limit-europe.geojson -limittocachebuffer 10000 -optimize
   ```
1. Delete pbf file
   ```bash
   rm europe-latest.osm.pbf extract.pbf
   ```
1. Stop prerendering
   ```bash
   systemctl stop freemap-mapnik-prerender
   ```
1. Deploy the import to production:
   ```bash
   imposm import -connection postgis://freemap:freemap@localhost/freemap -mapping mapping.yaml -deployproduction
   ```
1. Import `additional.sql` to PostgreSQL
1. Update `./diff/last.state.txt` to reflect timestamp and sequence number of the imported map.
   See https://planet.openstreetmap.org/replication/minute/ for finding sequence number.
1. Start imposm and wait to catch it up
   ```bash
   systemctl start imposm3
   ```
1. Now you can optionally stop imposm service to prevent it from interrupting prerendering.
   You can start it later after pre-rendering has been finished.
   You can also start it somewhere during pre-rendering to catch-up and stop again, to apply some recent updates.
1. Delete content of `./expires` directory
1. Edit `./config/prerender.json5` and change `rerenderOlderThanMs` to current time plus a minute or more
1. Stop ondemand rendering
   ```bash
   systemctl stop freemap-mapnik-ondemand
   ```
1. Delete cached highzoom tiles and indexes
   ```bash
   cd ./tiles
   rm -rf 15 16 17 18 19
   cd ..
   find ./tiles/14 -name '*.index' -delete
   ```
1. Start ondemand rendering
   ```bash
   systemctl start freemap-mapnik-ondemand
   ```
1. Start prerendering
   ```bash
   systemctl start freemap-mapnik-prerender
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
