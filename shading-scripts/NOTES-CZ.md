```
find . -type f -name "*.zip" -print0 | xargs -0 -P 24 -I {} sh -c 'unzip  "{}"'

find . -name '*.laz' | parallel -j 24 'pdal translate -i {} -o ../reprojected/{/.}.laz reprojection --filters.reprojection.in_srs="EPSG:5514" --filters.reprojection.out_srs="EPSG:3857"'

wine ~/OSM/LAStools/bin/lastile64.exe -lof ../files -tile_size 5000 -olaz -odir ../tiles -buffer 30


#find . -name '*.laz' | parallel -j 24 'wine ~/OSM/LAStools/bin/las2dem64.exe -i {} -o ../dem/{/.}.tif -step 1.194328566968441 -use_tile_bb'

find . -name '*.laz' | parallel -j 24 'wine ~/OSM/LAStools/bin/las2dem64.exe -i {} -o ../dem/{/.}.tif -step 1.194328566968441 -kill 10000'


# gdal_retile.py -co COMPRESS=LZW -ps 40000 40000 -overlap 10 -co BIGTIFF=YES -targetDir ../oksize f.tif

find . -name '*.tif' | parallel -j 24 gdal_edit.py -a_srs epsg:3857 {}

# for i in *.tif do ~/opt/WBT/whitebox_tools -r=FeaturePreservingSmoothing --dem=$i --num_iter=4 --norm_diff=30 --filter=20 -o=../smooth/$i; done

find . -name '*.tif' | parallel -j 6 ~/opt/WBT/whitebox_tools -r=FeaturePreservingSmoothing --dem={} --num_iter=4 --norm_diff=30 --filter=20 -o=../smooth/{};

tail --pid=2852588 -f /dev/null;

mkdir ../crop

find . -name '*.tif' -type f | parallel -j 16 bash -c 'a=4; file=`basename "{}"`; x=${file%%_*}; y=${file%.*}; y=${y##*_}; nice gdal_translate -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS -projwin $((x-2)) $((y+5000+2)) $((x+5000+2)) $((y-2)) "$file" "../crop/$file"'

cd ../crop
gdalbuildvrt *.tif merged.vrt

gdalwarp -overwrite -of GTiff -cutline ../mask.gpkg -cl mask -crop_to_cutline -co TILED=YES -co BIGTIFF=YES -co COMPRESS=DEFLATE -co PREDICTOR=2 -co NUM_THREADS=ALL_CPUS merged.vrt ../merged_cropped.tif
```
