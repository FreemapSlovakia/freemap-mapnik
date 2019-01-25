module.exports = { layers };
const { RP } = require('./routes');

function layers(shading, contours) {
  return map => map
    .sqlLayer('landcover',
      'select type, geometry from osm_landusages_gen0 order by z_order',
      { maxZoom: 9 },
    )
    .sqlLayer('landcover',
      'select type, geometry from osm_landusages_gen1 order by z_order',
      { minZoom: 10, maxZoom: 11 },
    )
    .sqlLayer('landcover',
      'select type, geometry from osm_landusages order by z_order',
      { minZoom: 12 },
    )
    .sqlLayer('water_area',
      'select geometry, type from osm_waterareas_gen1',
      { maxZoom: 11 },
    )
    .sqlLayer('water_area',
      'select geometry, type from osm_waterareas',
      { minZoom: 12 },
    )
    .sqlLayer('water_line',
      'select geometry, type from osm_waterways_gen1',
      { maxZoom: 11 },
    )
    .sqlLayer('water_line',
      'select geometry, type from osm_waterways',
      { minZoom: 12 },
    )
    .sqlLayer('feature_lines',
      'select geometry, type from osm_feature_lines',
      { minZoom: 13 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class from osm_roads_gen0 order by z_order',
      { maxZoom: 9 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class from osm_roads_gen1 order by z_order',
      { minZoom: 10, maxZoom: 11 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class from osm_roads_gen1 order by z_order',
      { maxZoom: 11 },
    )
    .sqlLayer(['higwayGlows', 'highways'],
      'select geometry, type, tracktype, class from osm_roads order by z_order',
      { minZoom: 12, cacheFeatures: true },
    )
    // .sqlLayer('highways',
    //   'select geometry, type, tracktype, class from osm_roads_gen0 order by z_order',
    //   { maxZoom: 13 },
    // )
    .sqlLayer('buildings',
      'select geometry, type from osm_buildings',
      { minZoom: 13 },
    )
    .sqlLayer('barrierways',
      'select geometry, type from osm_barrierways',
      { minZoom: 16 },
    )
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
          file: 'hgt/hillshade_warped_lz.tif',
        }, { minZoom: 14 });
        map.layer('hillshade', {
          type: 'gdal',
          file: 'hgt/hillshade_warped.tif',
        }, { maxZoom: 14 });
      }
    })
    .sqlLayer('protected_areas',
      'select type, geometry from osm_protected_areas')
    .sqlLayer('borders',
      'select geometry from osm_admin where admin_level = 2')
    .sqlLayer('military_areas',
      "select geometry from osm_landusages where type = 'military'")
    .sqlLayer('routes',
      `select geometry,
          concat('/', string_agg(concat(case when osm_routes.type in ('foot', 'hiking') then case when network in ('rwn', 'nwn', 'iwn') then '${RP.GLOBAL_HIKING}' else '${RP.LOCAL_HIKING}' end else '#' end, regexp_replace("osmc:symbol", ':.*', '')), '/'), '/') AS osmc_colour,
          concat('/', string_agg(concat(case when osm_routes.type in ('bicycle', 'mtb') then '${RP.BICYCLE}' when osm_routes.type in ('ski', 'piste') then '${RP.SKI}' else '#' end, colour), '/'), '/') AS colour,
          case when osm_routes.type in ('foot', 'hiking') then 'hiking' when osm_routes.type in ('bicycle', 'mtb', 'ski', 'piste') then 'bicycleAndSki' else '???' end AS groupType
        from osm_route_members join osm_routes using(osm_id)
        group by member, geometry, groupType`,
      { minZoom: 10, clearLabelCache: 'on' /*, cacheFeatures: true*/ }, // NOTE clearing cache because of contour elevation labels
    )
    .sqlLayer('placenames',
      'select name, type, geometry from osm_places order by z_order desc',
      { bufferSize: 1024, maxZoom: 14 })
    .sqlLayer('feature_points',
      `select * from (select type, geometry from osm_feature_points
        union all select type, geometry from osm_feature_polys
        union all select type, geometry from osm_shops
        union all select type, geometry from osm_buildings where type in ('church', 'chapel', 'cathedral', 'temple', 'basilica')
        union all select type, geometry from osm_infopoints) as abc left join zindex using (type)
        order by z`,
      { minZoom: 10 },
    )
    .sqlLayer('feature_point_names',
      `select * from (select type, geometry, name, ele from osm_feature_points
        union all select type, geometry, name, ele from osm_feature_polys
        union all select type, geometry, name, null as ele from osm_shops
        union all select type, geometry, name, null as ele from osm_buildings where type in ('church', 'chapel', 'cathedral', 'temple', 'basilica')
        union all select type, geometry, name, ele from osm_infopoints) as abc left join zindex using (type)
        order by z`,
      { minZoom: 10 },
    )
    .sqlLayer('highway_names',
      'select name, geometry, type from osm_roads order by z_order desc',
      { minZoom: 15 },
    )
    .sqlLayer('water_line_names',
      'select geometry, name, type from osm_waterways',
      { minZoom: 12 },
    )
    .sqlLayer('water_area_names',
      'select name, geometry, type from osm_waterareas',
      { minZoom: 12 },
    )
    .sqlLayer('feature_line_names',
      'select geometry, name, type from osm_feature_lines',
      { minZoom: 14 },
    )
    // .sqlLayer('building_names',
    //   'select name, type, geometry from osm_buildings')
    .sqlLayer('protected_area_names',
      'select type, name, geometry from osm_protected_areas')
    .sqlLayer('locality_names',
      "select name, type, geometry from osm_places where type in ('locality')",
      { minZoom: 15 },
    )
    .sqlLayer('placenames',
      'select name, type, geometry from osm_places order by z_order desc',
      { clearLabelCache: 'on', bufferSize: 1024, minZoom: 15 },
    );
}
