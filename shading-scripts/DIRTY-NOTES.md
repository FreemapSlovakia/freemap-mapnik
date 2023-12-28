# SI:

gdal_rasterize -burn 255 -init 0 -a_nodata 0 -a_srs EPSG:3857 -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -tr 1.194328566968441 1.194328566968441 -tap -ot Byte si-sb.gpkg si-mask.tif

### Other DEM sources

https://www.planlaufterrain.com/LiDAR-Data-and-FAQ/
austria: https://data.europa.eu/data/datasets/dtm-austria?locale=en (-> https://drive.google.com/drive/folders/1jbEi-ZI4Fiyk5Qq4VWXUUOTY7yWJGkhX ; https://drive.google.com/drive/folders/1GEXis6pHcqn3MqvsDBuOlRU5kSS1O6Xk)
austria: https://data.opendataportal.at/dataset/dtm-austria

### Slovenia TODO

https://github.com/nejcd/LidarSloveniaDataDownloader/tree/master/data
https://gis.stackexchange.com/questions/338374/problem-processing-slovenian-lidar-dtm-with-gdal-and-qgis-too-many-stepy-val
https://gis.stackexchange.com/questions/389803/how-to-use-gdal-grid-with-ungridded-asc-dtm-files
http://gis.arso.gov.si/evode/profile.aspx?id=atlas_voda_Lidar@Arso&culture=en-US
https://paleoseismicity.org/tutorial-how-to-make-a-dem-from-the-slovenian-lidar-data/
https://arheologija.neocities.org/Lidar_tutorial.html

wget -i ./slovenia/urls
pdal pipeline ./slovenia/pdal_dtm.json
whitebox_tools -r=FeaturePreservingSmoothing --dem=GK_535_153_filled.tif --num_iter=3 --norm_diff=30 --filter=11 -o=./GK_535_153_smooth.tif --wd=.
gdal_edit.py -a_srs EPSG:3794 GK_535_153_filled.tif

(6378137 _ pi _ 2) / (2 ^ 13) / 256 = 19.1092570713 vs 19.093

# SK+PL

gdal_contour -f PostgreSQL -nln cont -i 10 -a height build/merged.tif "PG:host=localhost user=martin password=\*\*\*\* dbname=martin"

create hgt files from sk.tif
for merging see https://gist.github.com/zdila/9dc0ffa6712d84470b2846d061b8da7d
for i in ../../../HGT/\*.HGT; do b=$(basename ${i%.HGT}); gdalwarp -ct "+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=hgridshift +grids=Slovakia_JTSK03_to_JTSK.gsb +step +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=unitconvert +xy_in=rad +xy_out=deg" -r bilinear -of GTiff -overwrite -tr 0.0002777777777777777777777 -0.000277777777777777777777 -te $(gdalinfo -json $i | jq -r '[.cornerCoordinates.upperLeft[0], .cornerCoordinates.lowerLeft[1], .cornerCoordinates.lowerRight[0], .cornerCoordinates.upperRight[1]] | join(" ")') -ot Int16 -dstnodata -32768 -of SRTMHGT sk.tif $b.hgt; done

## dmr5 stuff (SK, PL)

mkdir links
cd links
find .. -path '../LOT*/DMR*.tif' -exec sh -c 'ln -s {} `basename {}`' \;
find -name '_.tif' -exec gdal_edit.py -ro {} -a_srs EPSG:8353 \;
gdalbuildvrt -resolution highest merged.vrt _.tif
gdal_translate -co NUM_THREADS=ALL_CPUS -r nearest -co COMPRESS=DEFLATE -co PREDICTOR=2 -co ZLEVEL=9 -co BIGTIFF=YES --config GDAL_CACHEMAX 1024 merged.vrt merged.tif

## retile (only) big SK tiffs - cut to halves

mv r*01_17_s.* r*02_17_s.* r*05_17_s.* r*06_18_s.* r*07_17_s.* r*09_17_s.* r*10_17_s.* r*12_18_s.* r*13_18_s.* r*14_18_s.* r*17_18_s.* r*19_18_s.* r*20_18_s.* r*21_18_s.* r*23_20_s.* r*25_19_s.* r_26_18_s.\* oksize/
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 500000 30000 -overlap 100 -targetDir oksize/ r_03_17_s.tif
ALT: python /usr/lib/python3/dist-packages/osgeo_utils/gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 40000 40000 -overlap 100 -targetDir oksize/ LIDAR_UGKK_DEM5_0_JTSK03_1m.tif
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 500000 40000 -overlap 100 -targetDir oksize/
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 500000 40000 -overlap 100 -targetDir oksize/ r_04_17_s.tif
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 35000 40000000 -overlap 100 -targetDir oksize/ r_08_17_s.tif
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 100000000 35000 -overlap 100 -targetDir oksize/ r_11_17_s.tif
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 100000000 28000 -overlap 100 -targetDir oksize/ r_18_20_s.tif
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 40000 100000000 -overlap 100 -targetDir oksize/ r_22_18_s.tif
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 40000 100000000 -overlap 100 -targetDir oksize/
gdal_retile.py -co COMPRESS=DEFLATE -co PREDICTOR=2 -ps 31000 100000000 -overlap 100 -targetDir oksize/ r_29_19_s.tif

## smooth SK

cd oksize; for i in \*.tif; do echo $i; nice whitebox_tools -r=FeaturePreservingSmoothing --dem=$i --num_iter=3 --norm_diff=30 --filter=11 -o=../smooth-sk/$i --wd=.; done

## smooth PL

cd pl; find -name '\*.tif' | nice parallel -j 12 whitebox_tools -r=FeaturePreservingSmoothing --dem={} --num_iter=4 --norm_diff=30 --filter=20 -o=../smooth-pl/{} --wd=.

## build SK vrt

gdalbuildvrt -r cubic smooth-sk.vrt smooth-sk/\*.tif

## build PL vrt

gdalbuildvrt -r cubic smooth-pl.vrt smooth-pl/\*.tif

## warp SK (Z17)

gdalwarp -s_srs 'EPSG:8353' -t_srs 'EPSG:3857' -ct '+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=webmerc +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84' -tr 1.194328566968441 1.194328566968441 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi smooth-sk.vrt smooth-sk-warped.tif

## warp PL (Z17)

gdalwarp -t_srs 'EPSG:3857' -tr 1.194328566968441 1.194328566968441 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi smooth-pl.vrt smooth-pl-warped.tif

## Merge SK+PL

gdalbuildvrt -r cubic merged.vrt smooth-pl-warped.tif smooth-sk-warped.tif

## Create shading

mkdir build && make -j8 build/final.tif.ovr

## Create mask

gdal_calc.py --co=BIGTIFF=YES --co=TILED=YES --co=NUM_THREADS=ALL_CPUS --co=COMPRESS=DEFLATE -A build/A.tif --outfile=build/mask.tif --NoDataValue=0 --calc="255"
gdaladdo -r cubic --config BIGTIFF_OVERVIEW YES --config PREDICTOR_OVERVIEW 2 --config COMPRESS_OVERVIEW DEFLATE -ro mask.tif

// don't use: mapnik is slow with the following solution, we will use mask

don't use: gdalbuildvrt -resolution highest -r lanczos out.vrt /home/martin/fm/freemap-mapnik/shading/build/final.tif ./build/final.tif

for contours (PL)
find -name '\*.tif' | parallel -j 12 whitebox_tools -r=FeaturePreservingSmoothing --dem={} --num_iter=4 --norm_diff=30 --filter=20 -o=../smoother/{} --wd=.

## Contours

### SK Z14

gdalwarp -s_srs 'EPSG:8353' -t_srs 'EPSG:3857' -ct '+proj=pipeline +step +inv +proj=krovak +lat_0=49.5 +lon_0=24.8333333333333 +alpha=30.2881397527778 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +step +proj=push +v_3 +step +proj=cart +ellps=bessel +step +proj=helmert +x=485.021 +y=169.465 +z=483.839 +rx=-7.786342 +ry=-4.397554 +rz=-4.102655 +s=0 +convention=coordinate_frame +step +inv +proj=cart +ellps=WGS84 +step +proj=pop +v_3 +step +proj=webmerc +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84' -tr 9.55462853565 9.55462853565 -tap -r cubicspline -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi sk2.vrt sk-warped.tif

### PL Z14

gdalwarp -t_srs 'EPSG:3857' -tr 9.55462853565 9.55462853565 -tap -r cubicspline -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi pl.vrt pl-warped.tif

### merge SK+PL

gdalbuildvrt -r bilinear merged-cont.vrt pl-warped.tif sk-warped.tif

### contours

gdal_contour -f PostgreSQL -nln cont_dmr -i 10 -a height merged-cont.vrt "PG:host=localhost user=martin password=\*\*\*\* dbname=martin"

### split contours using nodejs utility

CREATE TABLE cont_dmr_split AS SELECT id, height, wkb_geometry FROM cont_dmr LIMIT 0;
CREATE INDEX cont_dmr_split_geom_idx ON cont_dmr_split USING GIST (wkb_geometry);

pg_dump --username martin --format plain --verbose --file cont_dmr_split.pgdump --table cont_dmr_split
remove owner SQL from the dump
import on fm server: psql -h localhost -U freemap -d freemap -1 -f cont_dmr_split.pgdump

## find tiles to re-render

gdal2tiles.py -r near -z 14 --xyz -x --processes=$(getconf \_NPROCESSORS_ONLN) -n -w none mask.tif masktiles
cd masktiles
find -name '\*.png' | sed -e 's/\.\/\|\.png//g' > ../dirty.tiles

## simple HS (z18)

gdalwarp -t_srs 'EPSG:3857' -tr 0.59716428348 0.59716428348 -tap -r cubic -of GTiff -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -wo NUM_THREADS=ALL_CPUS -multi sk.vrt sk-warped.tif
gdaldem hillshade -alg Horn -z 1.5 -co JPEG_QUALITY=95 -co COMPRESS=JPEG -co NUM_THREADS=24 -co TILED=YES -co BIGTIFF=YES sk-warped.tif sk-hs.tif
gdal2tiles.py -r near -z 18 --xyz --processes=$(getconf \_NPROCESSORS_ONLN) -n -w none sk-hs.tif sh
find -type d | parallel -j 24 mogrify -format jpg '{}/\*.png'
