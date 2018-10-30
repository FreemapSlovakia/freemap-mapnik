#!/bin/bash
for i in *.HGT; do
  x=${i%.HGT}
  echo $x

  gdal_contour -i 10 -a height $x.HGT ${x}_10m.shp
  shp2pgsql -p -I -g way -s 4326:900913 ${x}_10m.shp contour | psql
  shp2pgsql -a -g way -s 4326:900913 ${x}_10m.shp contour | psql
  rm ${x}_10m.shp

  gdaldem hillshade -s 111120 -compute_edges -multidirectional $x.HGT $x.tif
  gdal_translate -of GTiff -co "TILED=YES" -a_srs "+proj=latlong" $x.tif ${x}_adapted.tif
  gdalwarp -of GTiff -co "TILED=YES" -srcnodata 32767 -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" -rcs -order 3 -tr 30 30 -multi ${x}_adapted.tif ${x}_warped.tif
  rm $x.tif ${x}_adapted.tif
done
