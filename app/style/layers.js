const config = require('config');

const contours = config.get('contours');
const shading = config.get('shading');

module.exports = (map) => map
  .addSqlLayer('landcover',
    'select name, type, geometry from osm_landusages order by z_order')
  .addSqlLayer('water_area',
    'select geometry, type from osm_waterareas')
  .addSqlLayer('protected_areas',
    'select geometry from osm_protected_areas')
  .addSqlLayer('borders',
    'select geometry from osm_admin where admin_level = 2')
  .addSqlLayer('water_line',
    'select geometry, name, type from osm_waterways')
  .addSqlLayer('naturalways',
    'select geometry, type from osm_naturalways')
  .addSqlLayer('higwayGlows',
    'select geometry, type, tracktype from osm_roads order by z_order')
  .addSqlLayer('highways',
    'select geometry, type, tracktype from osm_roads order by z_order')
  .addSqlLayer('buildings',
    'select geometry, type from osm_buildings')
  .doInMap((map) => {
    if (contours) {
      map.addSqlLayer('contours',
        'select height, way from contour');
    }
    if (shading) {
      map.addLayer('hillshade', {
        type: 'gdal',
        file: 'hgt/hillshade_warped.tif',
      });
    }
  })
  .addSqlLayer('routes',
    `select geometry,
        concat('/', string_agg(concat(case when network in ('rwn', 'nwn', 'iwn') then '0' else '1' end, regexp_replace("osmc:symbol", ':.*', '')), '/'), '/') AS osmc_colour,
        concat('/', string_agg(colour, '/'), '/') AS colour,
        osm_routes.type
      from osm_route_members join osm_routes using(osm_id)
      group by member, geometry, osm_routes.type`)
  .addSqlLayer('feature_points',
    'select type, geometry from osm_feature_points')
  .addSqlLayer('infopoints',
    'select type, geometry from osm_infopoints',
    { /* bufferSize: 512 */ })

  .addSqlLayer('highway_names',
    'select name, geometry, type from osm_roads order by z_order desc')
  .addSqlLayer('water_line_names',
    'select geometry, name, type from osm_waterways')
  .addSqlLayer('water_area_names',
    'select name, geometry, type from osm_waterareas')
  .addSqlLayer('feature_point_names',
    'select name, ele, type, geometry from osm_feature_points')
  .addSqlLayer('infopoint_names',
    'select name, ele, type, geometry from osm_infopoints',
    { /* bufferSize: 512 */ })
  .addSqlLayer('building_names',
    'select name, type, geometry from osm_buildings')
  .addSqlLayer('protected_area_names',
    'select name, geometry from osm_protected_areas')
  .addSqlLayer('placenames',
    'select name, type, geometry from osm_places order by z_order desc',
    { clearLabelCache: 'on', bufferSize: 1024 });
