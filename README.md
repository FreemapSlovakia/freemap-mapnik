# Mapnik based Freemap Outdoor Map

## Demo

https://www.freemap.sk/?layers=X (make sure to have port 4000 accessible)

## Requirements

- Node.js
- PostGIS
- GDAL including python-gdal
- imposm3

## Installation

1. Get OpenStreetMap data (eg. from [Geofabrik](http://download.geofabrik.de/))
1. Create a postgis database (see below for details)
1. Import OpenStreetMap data (see below for details)
1. Get digital elevation data and import it to database (optional; see below for details)
1. Change directory to project directory
1. Run `npm i`
1. Create `config/development.json5` where you can override settings from `config/default.json5` for your local environment
1. Run `npm run watch`
1. Open `preview.html` in your browser

## Importing OSM data to PostGIS

In following commands replace `<you>` with your username.

### Prepare database

- `sudo su - postgres` (skip this on MacOS)
- `createdb <you>`
- `createuser <you>`
- `psql <you>`
- `CREATE EXTENSION postgis;`
- `CREATE EXTENSION postgis_topology;`
- `GRANT CREATE ON DATABASE <you> TO <you>;`

### Import OpenStreetMap to database

You must have imposm3 installed. For instructions how to build it see https://github.com/omniscale/imposm3.

To import the data use following command (with correct pbf filename):

```
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping imposm-mapping.json -read slovakia-latest.osm.pbf -write
```

Afterwards deploy the import to production:

```
~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping imposm-mapping.json -deployproduction
```

#### Building Imposm on MacOS

```
brew install golang leveldb geos
```

and then execute the commands [here](https://github.com/omniscale/imposm3/#compile)

## Contours and shaded relief (optional)

1. Obtain digital elevation data from [EarthExplorer](https://earthexplorer.usgs.gov/)
   - recommended Data Set is _SRTM 1 Arc-Second Global_
   - use GeoTIFF format
1. Create `hgt` directory and put there downloaded files.
1. To generate shaded relief run `scripts/generate_shaded_relief.sh`
1. To generate shaded relief run `scripts/import_contours.sh`

## Setting up minutely diff applying (working notes)

1. Download `europe-latest.osm.pbf` from Geofabrik
1. Extract area of focus with Osmium:
   ```
   osmium extract -p limit.geojson europe-latest.osm.pbf -o sk.pbf
   ```
1. Import the extract:
   ```
   ~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping imposm-mapping.json -read sk.pbf -diff -write  -diff -cachedir ./cache -diffdir ./diff
   ```
1. Deploy the import to production:
   ```
   ~/go/bin/imposm import -connection postgis://<you>:<your_password>@localhost/<you> -mapping imposm-mapping.json -deployproduction
   ```
1. Update `./diff/last.state.txt` to reflect timestamp of the imported map (I think that for sure the timestamp can be even bit older)
1. Delete cached tiles
1. Run minutely diff importing in the background:
   ```
   nohup ~/go/bin/imposm run -connection postgis://<you>:<your_password>@localhost/<you> -mapping imposm-mapping.json -limitto limit.geojson  -cachedir ./cache -diffdir ./diff -expiretiles-zoom 15 -expiretiles-dir ./expires &
   ```
