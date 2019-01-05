#/bin/bash
apt-get update \
  && apt-get -y install --no-install-recommends postgresql-client \
  && wget -qO- sandbox.freemap.sk/martin/contours.sql.gz | gzip -d | PGPASSWORD=secret psql -h freemap-postgis postgres postgres
