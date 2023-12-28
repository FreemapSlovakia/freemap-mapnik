## Contours and shaded relief

Current the source code is prepared to have different shading & contour data per country - see [ShadingAndContours.tsx](../style/ShadingAndContours.tsx).
If you only have data for other countries or a single region then update that file accordingly.

For global DEM data [ALOS World 3D - 30m](https://www.eorc.jaxa.jp/ALOS/en/aw3d30/data/index.htm) seems to be currently the best source.
First you must create an account there to be able to download DEM data.

To create hillshading use [Makefile](../shading-scripts/Makefile). Depending on the input data it may need some customization.
For contours see [DIRTY-NOTES.md](../shading-scripts/DIRTY-NOTES.md).

_TODO: improve documentation_

Rendered shading files are stored in [shading](./shading)`/{cc}` directory, where `{cc}` is a country code of a shading specific to a particular country. In every counrty folter there must fe a `final.tif` file and `mark.tif`. Directly in the `shading` is also `final.tiff` with "global" shading - a fallback shading with the lowest reslution.
