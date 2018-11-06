#!/bin/bash

for tif in *_1arc_v3.tif; do
  echo Processing $tif
  shp=${tif%.tif}_10m.shp

  gdal_contour -i 10 -a height $tif $shp
  shp2pgsql -p -I -g way -s 4326:900913 $shp contour | psql
  shp2pgsql -a -g way -s 4326:900913 $shp contour | psql
done

# Fix contour artifacts at borders

echo 'ALTER TABLE contour ALTER COLUMN way TYPE geometry(linestring,900913) USING ST_GeometryN(way, 1); UPDATE contour SET way = ST_RemovePoint(ST_RemovePoint(way, ST_NPoints(way) - 1), 0) WHERE ST_IsClosed(way) = false;' > psql
