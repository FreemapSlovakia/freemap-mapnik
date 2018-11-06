## Demo

https://codepen.io/zdila/pen/xQGjYo

## Requirements

- Node.js
- PostGIS
- GDAL including python-gdal
- imposm3

## Installation

1. Get OpenStreetMap data (eg. from [Geofabrik](http://download.geofabrik.de/))
1. Create a postgis database (see below for details)
1. Import OpenStreetMap data (see below for details)
1. Get digital elevation data and import it to DB (see below for details)
1. Change directory to project directory
1. Run `npm i`
1. Create `config/development.json5` where you can override settings from `config/default.json5` for your local environment
1. Run `npm run watch`
1. Open `preview.html` in your browser

## Importing OSM data to PostGIS

In following commands replace `<you>` with your username.

### Prepare database

- `sudo su - postgres`
- `createdb <you>`
- `createuser <you>`
- `psql martin`
- `CREATE EXTENSION postgis;`
- `CREATE EXTENSION postgis_topology;`
- `GRANT CREATE ON DATABASE <you> TO <you>;`

### Import OpenStreetMap to database

You must have imposm3 installed. For instructions how to build it see https://github.com/omniscale/imposm3.

To import the data use following command (with correct pbf filename).
```
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping imposm-mapping.json -read slovakia-latest.osm.pbf -write
```

## Contours and shaded relief (optional)

1. Obtain digital elevation data from [EarthExplorer](https://earthexplorer.usgs.gov/)
   - recommended Data Set is _SRTM 1 Arc-Second Global_
   - use GeoTIFF format
1. Create `hgt` directory and put there downloaded files.
1. To generate shaded relief run `scripts/generate_shaded_relief.sh`
1. To generate shaded relief run `scripts/import_contours.sh`

### Fixing contour boundary artifacts

To fix contour artifacts run following SQL in postgres client:

```
ALTER TABLE contour ALTER COLUMN way TYPE geometry(linestring,900913) USING ST_GeometryN(way, 1);
update contour set way = ST_RemovePoint(ST_RemovePoint(way, ST_NPoints(way) - 1), 0) where ST_IsClosed(way) = false;
```
