# Computing peak isolations

Peak isolations are required to render prominent peaks on lower zooms and with higher priority.

For `isolations` command use one at https://github.com/der-stefan/OpenTopoMap/tree/master/mapnik/tools.

Dowlnoad DEM data of europe from https://land.copernicus.eu/imagery-in-situ/eu-dem/eu-dem-v1.1, unzip it, `gdalbuildvrt gdalbuildvrt merged.vrt *.TIF`.

```
osmium tags-filter europe.osm.pbf n/natural=peak -o peaks.osm
osmconvert peaks.osm --out-csv --csv="@id @lon @lat ele" --csv-separator=";" > peaks.csv
gdalwarp -ot Int16 -t_srs EPSG:4326 -r cubicspline -order 3 -tr 0.001 0.001 merged.vrt merged4iso.tif
cat peaks.csv | ./isolation -f final4iso.tif | sed 's/;/,/g' > isolations.csv
psql
  create table isolations (osm_id bigint primary key, lon float, lat float, isolation int not null);
  \copy isolations from 'isolations.csv' WITH CSV;
```
