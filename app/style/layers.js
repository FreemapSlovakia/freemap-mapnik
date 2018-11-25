const config = require('config');

const contours = config.get('contours');
const shading = config.get('shading');

module.exports = (map) => map
  .sqlLayer('landcover',
    'select name, type, geometry from osm_landusages order by z_order')
  .sqlLayer('water_area',
    'select geometry, type from osm_waterareas')
  .sqlLayer('protected_areas',
    'select geometry from osm_protected_areas')
  .sqlLayer('borders',
    'select geometry from osm_admin where admin_level = 2')
  .sqlLayer('water_line',
    'select geometry, name, type from osm_waterways')
  .sqlLayer('feature_lines',
    'select geometry, type from osm_feature_lines')
  .sqlLayer('higwayGlows',
    'select geometry, type, tracktype from osm_roads order by z_order')
  .sqlLayer('highways',
    'select geometry, type, tracktype from osm_roads order by z_order')
  .sqlLayer('buildings',
    'select geometry, type from osm_buildings')
  .doInMap((map) => {
    if (contours) {
      map.sqlLayer(
        'contours',
        'select height, way from contour',
        { minZoom: 12 },
      );
    }
    if (shading) {
      map.layer('hillshade', {
        type: 'gdal',
        file: 'hgt/hillshade_warped.tif',
      });
    }
  })
  .sqlLayer('routes',
    `select geometry,
        concat('/', string_agg(concat(case when network in ('rwn', 'nwn', 'iwn') then '0' else '1' end, regexp_replace("osmc:symbol", ':.*', '')), '/'), '/') AS osmc_colour,
        concat('/', string_agg(colour, '/'), '/') AS colour,
        osm_routes.type
      from osm_route_members join osm_routes using(osm_id)
      group by member, geometry, osm_routes.type`,
    { minZoom: 9 })
  .sqlLayer('feature_points',
    'select type, geometry from osm_feature_points')
  .sqlLayer('feature_points',
    'select type, geometry from osm_feature_polys')
  .sqlLayer('infopoints',
    'select type, geometry from osm_infopoints',
    { /* bufferSize: 512 */ })

  .sqlLayer('highway_names',
    'select name, geometry, type from osm_roads order by z_order desc')
  .sqlLayer('water_line_names',
    'select geometry, name, type from osm_waterways')
  .sqlLayer('water_area_names',
    'select name, geometry, type from osm_waterareas')
  .sqlLayer('feature_line_names',
    'select geometry, name, type from osm_feature_lines')
  .sqlLayer('feature_point_names',
    'select name, ele, type, geometry from osm_feature_points')
  .sqlLayer('feature_point_names',
    'select name, ele, type, geometry from osm_feature_polys')
  .sqlLayer('infopoint_names',
    'select name, ele, type, geometry from osm_infopoints',
    { /* bufferSize: 512 */ })
  .sqlLayer('building_names',
    'select name, type, geometry from osm_buildings')
  .sqlLayer('protected_area_names',
    'select name, geometry from osm_protected_areas')
  .sqlLayer('placenames',
    'select name, type, geometry from osm_places order by z_order desc',
    { clearLabelCache: 'on', bufferSize: 1024 });
