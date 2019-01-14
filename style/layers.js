
module.exports = { layers };

function layers(shading, contours) {
  return map => map
    .sqlLayer('landcover',
      'select type, geometry from osm_landusages order by z_order')
    .sqlLayer('water_area',
      'select geometry, type from osm_waterareas')
    .sqlLayer('protected_areas',
      'select geometry from osm_protected_areas')
    .sqlLayer('borders',
      'select geometry from osm_admin where admin_level = 2')
    .sqlLayer('water_line',
      'select geometry, type from osm_waterways')
    .sqlLayer('feature_lines',
      'select geometry, type from osm_feature_lines')
    .sqlLayer(['higwayGlows', 'highways'],
      'select geometry, type, tracktype, class from osm_roads order by z_order',
      { cacheFeatures: true })
    .sqlLayer('buildings',
      'select geometry, type from osm_buildings')
    .sqlLayer('barrierways',
      'select geometry, type from osm_barrierways')
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

    .sqlLayer('placenames',
      'select name, type, geometry from osm_places order by z_order desc',
      { clearLabelCache: 'on', bufferSize: 1024, maxZoom: 14 }) // NOTE clearing cache because of contour elevation labels
    .sqlLayer('feature_points',
      'select * from (select type, geometry from osm_feature_points'
        + ' union all select type, geometry from osm_feature_polys'
        + ' union all select type, geometry from osm_shops' // TODO maybe namespace type; TODO shop polys
        + " union all select type, geometry from osm_buildings where type in ('church', 'chapel', 'cathedral', 'temple', 'basilica')" // TODO separate table for place_of_worship
        + ' union all select type, geometry from osm_infopoints) as abc left join zindex using (type)'
        + ' order by z'
    )
    .sqlLayer('feature_point_names',
      'select * from (select type, geometry, name, ele from osm_feature_points'
        + ' union all select type, geometry, name, ele from osm_feature_polys'
        + ' union all select type, geometry, name, null as ele from osm_shops' // TODO maybe namespace type; TODO shop polys
        + " union all select type, geometry, name, null as ele from osm_buildings where type in ('church', 'chapel', 'cathedral', 'temple', 'basilica')" // TODO separate table for place_of_worship
        + ' union all select type, geometry, name, ele from osm_infopoints) as abc left join zindex using (type)'
        + ' order by z'
    )
    .sqlLayer('highway_names',
      'select name, geometry, type from osm_roads order by z_order desc')
    .sqlLayer('water_line_names',
      'select geometry, name, type from osm_waterways')
    .sqlLayer('water_area_names',
      'select name, geometry, type from osm_waterareas')
    .sqlLayer('feature_line_names',
      'select geometry, name, type from osm_feature_lines')
    // .sqlLayer('building_names',
    //   'select name, type, geometry from osm_buildings')
    .sqlLayer('protected_area_names',
      'select name, geometry from osm_protected_areas')
    .sqlLayer('locality_names',
      "select name, type, geometry from osm_places where type in ('locality')")
    .sqlLayer('placenames',
      'select name, type, geometry from osm_places order by z_order desc',
      { clearLabelCache: 'on', bufferSize: 1024, minZoom: 15 });
}
