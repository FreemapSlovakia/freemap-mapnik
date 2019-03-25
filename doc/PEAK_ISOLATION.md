Quick notes:

```
osmconvert sk.pbf -o=sk.o5
osmfilter sk.o5m --keep="natural=peak" > peaks.osm
osmconvert peaks.osm --out-csv --csv="@id @lon @lat ele" --csv-separator=";" > peaks.csv
cat ~/peaks.csv | ./isolation -f /media/martin/data/martin/mapping/dmr20/new/merged_hgts.tiff | sed 's/;/,/g' > isolations.csv
psql
  create table isolations (osm_id bigint primary key, lon float, lat float, isolation int not null);
  \copy isolations from '/home/martin/OpenTopoMap/mapnik/tools/isolations.csv' WITH CSV;
```
