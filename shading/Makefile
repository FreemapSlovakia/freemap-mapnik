all: final.tiff

clean:
	rm -f *.tiff *.vrt

%.aa.tiff: %.hgt
	node antialiaser $< $@

antialiased = $(patsubst %.hgt,%.aa.tiff,$(wildcard *.hgt))

limit.shp: ../limit.geojson
	ogr2ogr -f 'ESRI Shapefile' limit.shp ../limit.geojson

merged.tiff: $(antialiased)
	gdal_merge.py -o merged.tiff $(antialiased)

clipped.tiff: merged.tiff
	gdalwarp -cutline limit.shp -crop_to_cutline merged.tiff clipped.tiff

translated.tiff: clipped.tiff
	gdal_translate -of GTiff -ot Float64 -co "TILED=YES" -a_srs "+proj=latlong" clipped.tiff translated.tiff

warped.tiff: translated.tiff
	gdalwarp -overwrite -of GTiff -ot Float64 -co "TILED=YES" -srcnodata 32767 -r cubicspline -order 3 -tr 20 20 -multi \
		-t_srs "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over" \
		translated.tiff warped.tiff

define gen_relief
	gdaldem hillshade warped.tiff _$(1).tiff -az $(2) -igor -compute_edges -z 1.7
endef

_a.tiff: warped.tiff
	$(call gen_relief,a,-120)

_b.tiff: warped.tiff
	$(call gen_relief,b,60)

_c.tiff: warped.tiff
	$(call gen_relief,c,-45)

_d.tiff: slope.tiff slope.ramp
	gdaldem color-relief slope.tiff slope.ramp _d.tiff

slope.tiff: warped.tiff
	gdaldem slope -p warped.tiff slope.tiff

a := 0.8 * (255 - A)
b := 0.7 * (255 - B)
c := 1.0 * (255 - C)
d := 0.0 * (255 - D) # note - intensity is zero = not used

contrast := 1.0
brightness := 0.0

define gen_band
	gdal_calc.py -A _a.tiff -B _b.tiff -C _c.tiff -D _d.tiff --outfile=$(1).tiff \
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
	gdal_calc.py -A _a.tiff -B _b.tiff -C _c.tiff -D _d.tiff --outfile=A.tiff \
		--calc="255.0 - 255.0 * ((1.0 - $(a) / 255.0) * (1.0 - $(b) / 255.0) * (1.0 - $(c) / 255.0) * (1.0 - $(d) / 255.0))"

stack.vrt: R.tiff G.tiff B.tiff A.tiff
	gdalbuildvrt -separate stack.vrt R.tiff G.tiff B.tiff A.tiff

final.tiff: stack.vrt R.tiff G.tiff B.tiff A.tiff
	gdal_translate -of GTiff -co "TILED=YES" stack.vrt final.tiff

