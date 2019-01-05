# Setting up development environment using Docker

## Requirements

* Docker

## Initial setup

Create project directory:

```
mkdir freemap-mapnik
cd freemap-mapnik
```

Install Docker and from project home directory (freemap-mapnik) run following commands:

```
# create network
docker network create --driver bridge freemap-bridge

# prepare volume for PostgreSQL
docker volume create pgdata

# start database
docker run --rm --name=freemap-postgis -v pgdata:/var/lib/postgresql/data --network=freemap-bridge -e POSTGRES_PASSWORD=secret -d mdillon/postgis

# clone the project and prepare map data (Slovakia)
docker run --rm --name=freemap-mapnik -v $(pwd):/freemap-mapnik --network=freemap-bridge -p 4000:4000 -w /freemap-mapnik -it zdila/freemap-mapnik-dev-env bash -c 'git clone https://github.com/FreemapSlovakia/freemap-mapnik.git . && ./docker/prepare_osm.sh && ./docker/prepare_hillshading.sh && ./docker/prepare_contours.sh'
```

## Running mapserver

From project home directory (freemap-mapnik) run following commands:

```
docker run --rm --name=freemap-mapnik -v $(pwd):/freemap-mapnik --network=freemap-bridge -p 4000:4000 -w /freemap-mapnik -e NODE_ENV=docker -it zdila/freemap-mapnik-dev-env bash -c 'npm i && npm run watch'
```

## Viewing the map

Alternatives:

* open [preview.html](../preview.html) in your browser
  * after changing and saving some style (eg. [app/style/index.js](../app/style/index.js)) just reload the page
* use any app where you can enter following TMS URL template: `http://localhost:4000/{z}/{x}/{y}`
* use JSOM
  * use TMS map URL `tms[19]:http://localhost:4000/{zoom}/{x}/{y}`
  * after changing and saving some style right-click the map and choose _FLush tile cache_.
