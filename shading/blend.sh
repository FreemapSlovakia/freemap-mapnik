#!/bin/bash

# fg(AB) bg(CD) res

FORMULA='(1.0*A*B/255.0 + 1.0*C*D/255.0*(1.0 - 1.0*B/255.0)) / (1.0*B/255.0 + 1.0*D/255.0*(1.0 - 1.0*B/255.0))'
# FORMULA='(1.0*A*B/255.0 + 1.0*C*D/255.0*(1.0-1.0*B/255.0))'

# compute each RGB band
gdal_calc.py -A $1 -B $1 --A_band=1 --B_band=4 -C $2 -D $2 --C_band=1 --D_band=4 --outfile=R.tiff --calc="$FORMULA" --type=Byte
gdal_calc.py -A $1 -B $1 --A_band=2 --B_band=4 -C $2 -D $2 --C_band=2 --D_band=4 --outfile=G.tiff --calc="$FORMULA" --type=Byte
gdal_calc.py -A $1 -B $1 --A_band=3 --B_band=4 -C $2 -D $2 --C_band=3 --D_band=4 --outfile=B.tiff --calc="$FORMULA" --type=Byte

# compute alpha
gdal_calc.py -B $1 --B_band=4 -D $2 --D_band=4 --outfile=A.tiff --calc='255.0*(1.0*B/255.0 + 1.0*D/255.0 - 1.0*B/255.0*D/255.0)' --type=Byte

# join bands
rm $3
gdal_merge.py -separate -o $3 R.tiff G.tiff B.tiff A.tiff

rm R.tiff G.tiff B.tiff A.tiff
