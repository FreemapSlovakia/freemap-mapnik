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
docker network create --driver bridge freemap-bridge
docker volume create pgdata

# start database
docker run --rm --name=freemap-postgis -v pgdata:/var/lib/postgresql/data --network=freemap-bridge -e POSTGRES_PASSWORD=secret -d mdillon/postgis

# clone the project and download the map
docker run --rm --name=freemap-mapnik -v $(pwd):/freemap-mapnik --network=freemap-bridge -p 4000:4000 -w /freemap-mapnik -it zdila/freemap-mapnik-dev-env bash -c 'git clone https://github.com/FreemapSlovakia/freemap-mapnik.git . && ./scripts/init.sh'
```

## Running mapserver

From project home directory (freemap-mapnik) run following commands:

```
docker run --rm --name=freemap-mapnik -v $(pwd):/freemap-mapnik --network=freemap-bridge -p 4000:4000 -w /freemap-mapnik -e NODE_ENV=docker -it zdila/freemap-mapnik-dev-env bash -c 'npm i && npm run watch'
```

## Viewing the map

Use following TMS URL to view tiles: `http://localhost:4000/{zoom}/{x}/{y}`

For viewing in JOSM:

* use TMS map URL `tms[19]:http://localhost:4000/{zoom}/{x}/{y}`
* after changing and saving some style (eg. [app/style/index.js](../app/style/index.js)) right-click the map and choose _FLush tile cache_.
