#/bin/bash
rm slovakia-latest.osm.pbf
wget http://download.geofabrik.de/europe/slovakia-latest.osm.pbf \
  && /go/bin/imposm import -connection postgis://postgres:secret@freemap-postgis/postgres -mapping mapping.yaml -read slovakia-latest.osm.pbf -write \
  && /go/bin/imposm import -connection postgis://postgres:secret@freemap-postgis/postgres -mapping mapping.yaml -deployproduction
