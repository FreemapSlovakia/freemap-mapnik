#!/bin/bash

filelist () {
  ogrinfo -ro -dialect SQLITE -sql \
    "select name as name from $1 where present == true order by name" \
    -q $1.gpkg \
    | grep 'name (String)' | sed 's/  name (String) = //'
}

# splits features from $1 into separate files in directory $2
# also makes directory $2_fat where are 40m buffered features
split() {
  tiles="$(filelist $1)"
  rm -rf $2 && mkdir -p $2
  rm -rf $2_fat && mkdir -p $2_fat
  for tile in $tiles; do
    echo $tile
    ogr2ogr -nln $tile -dialect SQLITE -sql \
      "select * from $1 where name = \"$tile\"" \
      $2/$tile.gpkg $1.gpkg
    ogr2ogr -nln $tile -dialect SQLITE -sql \
      "select fid, name, st_buffer($1.geom, 40, 2) as geom, present from $1 where name = \"$tile\"" \
      $2_fat/$tile.gpkg $1.gpkg
  done
}

split "sk_dmr50_tiling" "sk"
split "pl_tiling" "pl"
