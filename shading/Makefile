all: final.tiff.ovr contours_split.shp

clean:
	rm -f *.vrt contours* *.ovr

contours.shp: merged.tiff
	gdal_contour -snodata -9999 -i 10 -a height merged.tiff contours.shp

contours_split.geojson: contours.shp
	shp-polyline-splitter contours.shp height > contours_split.geojson

contours_split.shp: contours_split.geojson
	ogr2ogr -F 'ESRI Shapefile' contours_split.shp contours_split.geojson
	shapeindex contours_split.shp

define gen_relief
	gdaldem hillshade -of GTiff -co "BIGTIFF=YES" -co "TILED=YES" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" merged.tiff _$(1).tiff -az $(2) -igor -z 1.7
endef

_a.tiff: merged.tiff
	$(call gen_relief,a,-120)

_b.tiff: merged.tiff
	$(call gen_relief,b,60)

_c.tiff: merged.tiff
	$(call gen_relief,c,-45)

_d.tiff: slope.tiff slope.ramp
	gdaldem color-relief -of GTiff -co "BIGTIFF=YES" -co "TILED=YES" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" slope.tiff slope.ramp _d.tiff

slope.tiff: merged.tiff
	gdaldem slope -of GTiff -co "BIGTIFF=YES" -co "TILED=YES" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" -p merged.tiff slope.tiff

a := 0.8 * (255 - A)
b := 0.7 * (255 - B)
c := 1.0 * (255 - C)
d := 0.0 * (255 - D) # note - intensity is zero = not used

contrast := 1.0
brightness := 0.0

define gen_band
	gdal_calc.py --co "BIGTIFF=YES" --co "TILED=YES" --co "COMPRESS=ZSTD" --co "NUM_THREADS=ALL_CPUS" \
		-A _a.tiff -B _b.tiff -C _c.tiff -D _d.tiff --outfile=$(1).tiff \
		--calc="$(contrast) * (($(a) * $(2) + $(b) * $(3) + $(c) * $(4) + $(d) * $(5)) / (0.01 + $(a) + $(b) + $(c) + $(d)) - 128.0) + 128.0 + $(brightness)"
endef

# RGB colors per sub-relief are defined in columns
#          [a]  [b]  [c]  [d]

R.tiff: _a.tiff _b.tiff _c.tiff _d.tiff
	$(call gen_band,R,0x20,0xFF,0x00,0x00)

G.tiff: _a.tiff _b.tiff _c.tiff _d.tiff
	$(call gen_band,G,0x30,0xEE,0x00,0x00)

B.tiff: _a.tiff _b.tiff _c.tiff _d.tiff
	$(call gen_band,B,0x60,0x00,0x00,0x00)

A.tiff: _a.tiff _b.tiff _c.tiff _d.tiff
	gdal_calc.py --co "BIGTIFF=YES" --co "TILED=YES" --co "COMPRESS=ZSTD" --co "NUM_THREADS=ALL_CPUS" \
		-A _a.tiff -B _b.tiff -C _c.tiff -D _d.tiff --outfile=A.tiff \
		--calc="255.0 - 255.0 * ((1.0 - $(a) / 255.0) * (1.0 - $(b) / 255.0) * (1.0 - $(c) / 255.0) * (1.0 - $(d) / 255.0))"

stack.vrt: R.tiff G.tiff B.tiff A.tiff
	gdalbuildvrt -separate stack.vrt R.tiff G.tiff B.tiff A.tiff

final.tiff: stack.vrt R.tiff G.tiff B.tiff A.tiff
	gdal_translate -r cubicspline -of GTiff -ot Int16 -co "TILED=YES" -co "BIGTIFF=YES" -co "COMPRESS=ZSTD" -co "NUM_THREADS=ALL_CPUS" stack.vrt final.tiff

final.tiff.ovr: final.tiff
	gdaladdo -r lanczos --config BIGTIFF_OVERVIEW YES -ro final.tiff

# contours.sql: contours_split.shp
# 	shp2pgsql -S contours_split.shp contours > contours.sql
