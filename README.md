## Generating contours and importing to PostGIS

```
gdal_contour -i 10 -a height N48E020.HGT N48E020_10m.shp
shp2pgsql -a -g way -s 4326:900913 N48E020_10m.shp contour | psql
shp2pgsql -p -I -g way -s 4326:900913 N48E020_10m.shp contour | psql
```

## Generating shaded relief

```
gdaldem hillshade -s 111120 -compute_edges -multidirectional N48E020.HGT N48E020.tif
gdal_translate -of GTiff -co "TILED=YES" -a_srs "+proj=latlong" N48E020.tif N48E020_adapted.tif
gdalwarp -of GTiff -co "TILED=YES" -srcnodata 32767 -t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" -rcs -order 3 -tr 30 30 -multi N48E020_adapted.tif N48E020_warped.tif
```

## Importing OSM data to PostGIS

```
~/go/bin/imposm import -connection postgis://martin:b0n0@localhost/martin  -mapping imposm-mapping.json -read slovakia-latest.osm.pbf -write
```
