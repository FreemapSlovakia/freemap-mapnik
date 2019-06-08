# Computing peak isolations

Peak isolations are required to render prominent peaks on lower zooms and with higher priority.

For `isolations` command use one at https://github.com/der-stefan/OpenTopoMap/tree/master/mapnik/tools.

```
osmconvert extract.pbf -o=extract.o5
osmfilter extract.o5 --keep="natural=peak" > peaks.osm
osmconvert peaks.osm --out-csv --csv="@id @lon @lat ele" --csv-separator=";" > peaks.csv
cat ~/peaks.csv | ./isolation -f dem.tiff | sed 's/;/,/g' > isolations.csv
psql
  create table isolations (osm_id bigint primary key, lon float, lat float, isolation int not null);
  \copy isolations from 'isolations.csv' WITH CSV;
```
