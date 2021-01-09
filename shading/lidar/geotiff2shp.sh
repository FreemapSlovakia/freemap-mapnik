#!/bin/bash
# ---------------------------------------------------------------------
#   geotiff2shp.sh - vectorize geotiff file with correct coordinates
#   Copyright (C) 2013 Christoph Hormann <chris_hormann@gmx.de>
# ---------------------------------------------------------------------
#   geotiff2shp.sh is free software: you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation, either version 3 of the License, or
#   (at your option) any later version.
#
#   geotiff2shp.sh is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with geotiff2shp.sh.  If not, see <http://www.gnu.org/licenses/>.
#
#   Version 2: adding usage message and offset option
# ---------------------------------------------------------------------

TMPDIR="/tmp"
FILE_PREFIX="geotiff2shp_`hostname`_`date +%s`"

TIF="$1"
SHP="$2"
TYPE="$3"
POTRACE_OPTS="$4"
OFFSET="$5"

if [ -z "$SHP" ] ; then
	echo "geotiff2shp.sh"
	echo "--------------"
	echo ""
	echo "  converts a geotiff file (or other GDAL compatible raster)"
	echo "                 to a shapefile using potrace"
	echo ""
	echo "  Usage: geotiff2shp.sh \\"
	echo "           <raster> <shapefile> [type] [options] [offset]"
	echo ""
	echo "  Defaults: type: 'ESRI Shapefile'"
	echo "            options: '-z black -a 1.5 -t 1 -i'"
	echo "            offset: 0:0"
	echo ""
	exit
fi

if [ -z "$TYPE" ] ; then
	TYPE="ESRI Shapefile"
fi

if [ -z "$POTRACE_OPTS" ] ; then
	POTRACE_OPTS="-z black -a 1.5 -t 1 -i"
fi

INFO=`gdalinfo -nogcp -nomd -norat -noct -nofl "$TIF"`

SRS=`echo "$INFO" | grep -A 100 -E "^Coordinate System" | grep -B 100 -E "^Origin" | tail -n +2 | head -n -1`

X_START=`echo "$INFO" | grep -E "^Upper Left" | cut -d "(" -f 2 | cut -d "," -f 1 | sed "s? ??g"`
Y_START=`echo "$INFO" | grep -E "^Lower Left" | cut -d "," -f 2 | cut -d ")" -f 1 | sed "s? ??g"`

if [ ! -z "$OFFSET" ] ; then
	OFFSET_X=`echo "$OFFSET" | cut -d ":" -f 1`
	OFFSET_Y=`echo "$OFFSET" | cut -d ":" -f 2`

	X_START=`echo "$X_START + ($OFFSET_X)" | bc`
	Y_START=`echo "$Y_START + ($OFFSET_Y)" | bc`
fi

# requires same resolution in x and y
RES=`echo "$INFO" | grep -E "^Pixel Size" | cut -d "(" -f 2 | cut -d "," -f 1 | sed "s? ??g"`

if [ ! -z "$X_START" ] && [ ! -z "$Y_START" ] && [ ! -z "$RES" ] ; then

	gdal_translate -of PNM -ot Byte "$TIF" "$TMPDIR/${FILE_PREFIX}.pgm"
	rm -f "$TMPDIR/${FILE_PREFIX}.pgm.aux.xml"

	potrace $POTRACE_OPTS -b geojson -o "$TMPDIR/${FILE_PREFIX}.json" "$TMPDIR/${FILE_PREFIX}.pgm" -x $RES -L $X_START -B $Y_START

	rm -f "$SHP"

	if [ -z "$SRS" ] ; then
		ogr2ogr -f "$TYPE" "$SHP" "$TMPDIR/${FILE_PREFIX}.json"
	else
		ogr2ogr -a_srs "$SRS" -f "$TYPE" "$SHP" "$TMPDIR/${FILE_PREFIX}.json"
	fi

	rm -f "$TMPDIR/${FILE_PREFIX}.pgm" "$TMPDIR/${FILE_PREFIX}.json"

else
	echo "Error: could not read coordinates from $TIF"
fi
