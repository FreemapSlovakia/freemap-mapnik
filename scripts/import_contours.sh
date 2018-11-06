#!/bin/bash

for tif in *_1arc_v3.tif; do
  echo Processing $tif
  shp=${tif%.tif}_10m.shp

  gdal_contour -i 10 -a height $tif $shp
  shp2pgsql -p -I -g way -s 4326:900913 $shp contour | psql
  shp2pgsql -a -g way -s 4326:900913 $shp contour | psql
done
