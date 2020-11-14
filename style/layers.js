module.exports = { layers };

const towerType = `concat("class", '_', case type
  when 'communication' then 'communication'
  when 'observation' then 'observation'
  else 'other' end) as type`;

function getFeaturesSql(zoom) {
  const sqls = [`select * from (
    select osm_id, geometry, name, ele,
      case when isolation > 4500 then 'peak1'
        when isolation between 3000 and 4500 then 'peak2'
        when isolation between 1500 and 3000 then 'peak3'
        else 'peak' end as type, isolation
      from osm_features natural left join isolations where type = 'peak' and geometry && !bbox!`];

  if (zoom >= 12) {
    sqls.push(`
      union all select osm_id, geometry, name,         ele, case type when 'guidepost' then (case when name = '' then 'guidepost_noname' else 'guidepost' end) else type end as type, null as isolation
        from osm_infopoints
      union all select osm_id, geometry, name,         ele, 'aerodrome' as type, null as isolation
        from osm_aerodromes where icao <> ''
      union all select osm_id, geometry, name,         ele, 'aerodrome' as type, null as isolation
        from osm_aerodrome_polys where icao <> ''
    `);
  }

  if (zoom >= 14) {
    sqls.push(`
      union all select osm_id, geometry, name,         ele, type, null as isolation
        from osm_features where type <> 'peak'
      union all select osm_id, geometry, name,         ele, case type when 'communications_tower' then 'tower_communication' else type end as type, null as isolation
        from osm_feature_polys

      union all select osm_id, geometry, name,         ele, 'aerodrome' as type, null as isolation
        from osm_aerodromes where icao = ''
      union all select osm_id, geometry, name,         ele, 'aerodrome' as type, null as isolation
        from osm_aerodrome_polys where icao = ''

      union all select osm_id, geometry, name,         ele, type, null as isolation
        from osm_springs

      union all select osm_id, geometry, name, null as ele, 'ruins' as type, null as isolation
        from osm_ruins
      union all select osm_id, geometry, name, null as ele, 'ruins' as type, null as isolation
        from osm_ruin_polys

      union all select osm_id, geometry, name, null as ele, building as type, null as isolation
        from osm_place_of_worships where building in ('chapel', 'church', 'basilica', 'temple')
      union all select osm_id, geometry, name, null as ele, building as type, null as isolation
        from osm_place_of_worship_polys where building in ('chapel', 'church', 'basilica', 'temple')

      union all select osm_id, geometry, name,         ele, ${towerType}, null as isolation
        from osm_towers
      union all select osm_id, geometry, name,         ele, ${towerType}, null as isolation
        from osm_tower_polys

      union all select osm_id, geometry, name, null as ele, type, null as isolation
        from osm_transports
      union all select osm_id, geometry, name, null as ele, type, null as isolation
        from osm_transport_polys
    `);
  }

  if (zoom >= 15) {
    sqls.push(`
      union all select osm_id, geometry, name,         ele, case when type in ('shopping_cart') then 'shelter' || type else 'shelter' end as type, null as isolation
        from osm_shelters
      union all select osm_id, geometry, name,         ele, case when type in ('shopping_cart') then 'shelter' || type else 'shelter' end as type, null as isolation
        from osm_shelter_polys

      union all select osm_id, geometry, name, null as ele, type, null as isolation
        from osm_shops where type in ('convenience', 'fuel', 'confectionery', 'bicycle', 'supermarket')
      union all select osm_id, geometry, name, null as ele, type, null as isolation
        from osm_shop_polys where type in ('convenience', 'fuel', 'confectionery', 'bicycle', 'supermarket')
    `);
  }

  if (zoom >= 17) {
    sqls.push(`
      union all select osm_id, geometry, name, null as ele, type, null as isolation
        from osm_barrierpoints where type in ('lift_gate', 'swing_gate', 'gate')
    `);
  }

  sqls.push(`
    ) as abc left join z_order_poi using (type)
    where geometry && !bbox!
    order by z_order, isolation desc nulls last, ele desc nulls last, osm_id
  `);

  const sql = sqls.join('');

  return sql;
}

function layers(shading, contours, hikingTrails, bicycleTrails, skiTrails, horseTrails, format, custom, legendLayers) {

  if (legendLayers) {
    return (map) => map.doInMap((map) => {
      for (const layer of legendLayers) {
        map.layer(layer.styles, { type: 'geojson', inline: JSON.stringify(layer.geojson) }, { srs: '+init=epsg:4326' });
      }

      return map;
    });
  }

  const routesQuery = `
    select
      st_linemerge(st_collect(geometry)) as geometry,
      idx(arr1, 0) as h_red,
      idx(arr1, 1) as h_blue,
      idx(arr1, 2) as h_green,
      idx(arr1, 3) as h_yellow,
      idx(arr1, 4) as h_black,
      idx(arr1, 5) as h_white,
      idx(arr1, 6) as h_orange,
      idx(arr1, 7) as h_purple,
      idx(arr1, 10) as h_red_loc,
      idx(arr1, 11) as h_blue_loc,
      idx(arr1, 12) as h_green_loc,
      idx(arr1, 13) as h_yellow_loc,
      idx(arr1, 14) as h_black_loc,
      idx(arr1, 15) as h_white_loc,
      idx(arr1, 16) as h_orange_loc,
      idx(arr1, 17) as h_purple_loc,
      idx(arr2, 20) as b_red,
      idx(arr2, 21) as b_blue,
      idx(arr2, 22) as b_green,
      idx(arr2, 23) as b_yellow,
      idx(arr2, 24) as b_black,
      idx(arr2, 25) as b_white,
      idx(arr2, 26) as b_orange,
      idx(arr2, 27) as b_purple,
      idx(arr2, 30) as s_red,
      idx(arr2, 31) as s_blue,
      idx(arr2, 32) as s_green,
      idx(arr2, 33) as s_yellow,
      idx(arr2, 34) as s_black,
      idx(arr2, 35) as s_white,
      idx(arr2, 36) as s_orange,
      idx(arr2, 37) as s_purple,
      idx(arr1, 40) as r_red,
      idx(arr1, 41) as r_blue,
      idx(arr1, 42) as r_green,
      idx(arr1, 43) as r_yellow,
      idx(arr1, 44) as r_black,
      idx(arr1, 45) as r_white,
      idx(arr1, 46) as r_orange,
      idx(arr1, 47) as r_purple,
      refs1,
      refs2,
      icount(arr1 - array[1000, 1010, 1020, 1030, 1040]) as off1,
      icount(arr2 - array[1000, 1010, 1020, 1030, 1040]) as off2
    from (
      select
        array_to_string(
          array(
            select distinct itm from unnest(
              array_agg(
                case when osm_routes.type = 'horse' and colour in ('red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'violet', 'purple') or osm_routes.type in ('horse', 'hiking', 'foot') and "osmc:symbol" ~ '(red|blue|green|yellow|black|white|orange|violet|purple):.*' then case when name <> '' and ref <> '' then name || ' (' || ref || ')' else coalesce(nullif(name, ''), nullif(ref, '')) end else null end
              )
            ) as itm order by itm
          ),
          ', '
        ) as refs1,
        array_to_string(
          array(
            select distinct itm from unnest(
              array_agg(
                case when osm_routes.type in ('bicycle', 'mtb', 'ski', 'piste') and colour in ('red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'violet', 'purple') then case when name <> '' and ref <> '' then name || ' (' || ref || ')' else coalesce(nullif(name, ''), nullif(ref, '')) end else null end
              )
            ) as itm order by itm
          ),
          ', '
        ) as refs2,
        first(geometry) as geometry,
        uniq(sort(array_agg(
          case
            when ${!!horseTrails} and osm_routes.type = 'horse' then 40 +
              case colour
                when 'red' then 0
                when 'blue' then 1
                when 'green' then 2
                when 'yellow' then 3
                when 'black' then 4
                when 'white' then 5
                when 'orange' then 6
                when 'violet' then 7
                when 'purple' then 7
                else 1000 end
            when ${!!hikingTrails} and osm_routes.type in ('hiking', 'foot') then
              case when network in ('iwn', 'nwn', 'rwn') then 0 else 10 end +
              case
                when "osmc:symbol" like 'red:%' then 0
                when "osmc:symbol" like 'blue:%' then 1
                when "osmc:symbol" like 'green:%' then 2
                when "osmc:symbol" like 'yellow:%' then 3
                when "osmc:symbol" like 'black:%' then 4
                when "osmc:symbol" like 'white:%' then 5
                when "osmc:symbol" like 'orange:%' then 6
                when "osmc:symbol" like 'violet:%' then 7
                when "osmc:symbol" like 'purple:%' then 7
                else 1000 end
            else
              1000
            end
        ))) as arr1,
        uniq(sort(array_agg(
          case
            when osm_routes.type in ('bicycle', 'mtb', 'ski', 'piste') then
              case
                when ${!!bicycleTrails} and osm_routes.type in ('bicycle', 'mtb') then 20
                when ${!!skiTrails} and osm_routes.type in ('ski', 'piste') then 30
                else 1000 end +
              case colour
                when 'red' then 0
                when 'blue' then 1
                when 'green' then 2
                when 'yellow' then 3
                when 'black' then 4
                when 'white' then 5
                when 'orange' then 6
                when 'violet' then 7
                when 'purple' then 7
                else 1000 end
            else
              1000
            end
        ))) as arr2
      from osm_route_members join osm_routes using (osm_id)
      where geometry && !bbox!
      group by member
    ) as aaa
    group by
      h_red, h_blue, h_green, h_yellow, h_black, h_white, h_orange, h_purple,
      h_red_loc, h_blue_loc, h_green_loc, h_yellow_loc, h_black_loc, h_white_loc, h_orange_loc, h_purple_loc,
      b_red, b_blue, b_green, b_yellow, b_black, b_white, b_orange, b_purple,
      s_red, s_blue, s_green, s_yellow, s_black, s_white, s_orange, s_purple,
      r_red, r_blue, r_green, r_yellow, r_black, r_white, r_orange, r_purple,
      off1, off2, refs1, refs2
  `;

  return map => map
    .layer('sea',
      {
        type: 'shape',
        file: 'simplified-land-polygons-complete-3857/simplified_land_polygons.shp',
      },
      { srs: '+init=epsg:3857', maxZoom: 9 }
    )
    .layer('sea',
      {
        type: 'shape',
        file: 'land-polygons-split-3857/land_polygons.shp',
      },
      { srs: '+init=epsg:3857', minZoom: 10 }
    )
    .sqlLayer('landcover',
      'select type, geometry from osm_landusages_gen0 left join z_order_landuse using (type) where geometry && !bbox! order by z_order, osm_id',
      { maxZoom: 9 },
    )
    .sqlLayer('landcover',
      'select type, geometry from osm_landusages_gen1 left join z_order_landuse using (type) where geometry && !bbox! order by z_order, osm_id',
      { minZoom: 10, maxZoom: 11 },
    )
    .sqlLayer('landcover',
      'select type, geometry, name, area from osm_landusages left join z_order_landuse using (type) where geometry && !bbox! order by z_order, osm_id',
      { minZoom: 12, cacheFeatures: true },
    )
    .sqlLayer('cutlines',
      "select geometry, type from osm_feature_lines where type = 'cutline'",
      { minZoom: 13 },
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
      "select geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray from osm_waterways_gen1",
      { maxZoom: 11 },
    )
    .sqlLayer('water_line',
      "select geometry, type, tunnel, CASE WHEN intermittent OR seasonal THEN '6,3' ELSE '1000,0' END AS dasharray from osm_waterways",
      { minZoom: 12 },
    )
    .sqlLayer('trees',
      "select geometry from osm_features where type = 'tree'",
      { minZoom: 16, bufferSize: 128 },
    )
    // TODO split to several layers: underground/underwater, overground, overhead
    .sqlLayer('pipelines',
      'select geometry, location from osm_pipelines',
      { minZoom: 13 },
    )
    .sqlLayer('feature_lines',
      "select geometry, type from osm_feature_lines where type not in ('cutline', 'valley')",
      { minZoom: 13 },
    )
    .sqlLayer('embankments',
      'select geometry from osm_roads where embankment = 1 and geometry && !bbox!',
      { minZoom: 16 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service, bridge, tunnel from osm_roads_gen0 where geometry && !bbox! order by z_order, osm_id',
      { maxZoom: 9, groupBy: 'tunnel' },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service, bridge, tunnel from osm_roads_gen1 where geometry && !bbox! order by z_order, osm_id',
      { minZoom: 10, maxZoom: 11, groupBy: 'tunnel' },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service, bridge, tunnel from osm_roads_gen1 where geometry && !bbox! order by z_order, osm_id',
      { maxZoom: 11, groupBy: 'tunnel' },
    )
    .sqlLayer(['higwayGlows', 'highways'],
      // order bycase when type = 'rail' AND (service = 'main' OR service = '') then 1000 else z_order end
      'select geometry, type, tracktype, class, service, bridge, tunnel from osm_roads where geometry && !bbox! order by z_order, osm_id',
      { minZoom: 12, cacheFeatures: true, groupBy: 'tunnel' },
    )
    .sqlLayer('accessRestrictions',
      "select case when bicycle not in ('', 'yes', 'designated', 'official', 'permissive') or bicycle = '' and vehicle not in ('', 'yes', 'designated', 'official', 'permissive') "
      + "or bicycle = '' and vehicle = '' and access not in ('', 'yes', 'designated', 'official', 'permissive') then 1 else 0 end as no_bicycle, "
      + "case when foot not in ('', 'yes', 'designated', 'official', 'permissive') or foot = '' and access not in ('', 'yes', 'designated', 'official', 'permissive') then 1 else 0 end as no_foot, "
      + "geometry from osm_roads where type not in ('trunk', 'motorway', 'trunk_link', 'motorway_link') and geometry && !bbox!",
      { minZoom: 14 },
    )
    .sqlLayer('aerialways',
      'select geometry, type from osm_aerialways',
      { minZoom: 12 },
    )
    // .sqlLayer('highways',
    //   'select geometry, type, tracktype, class, service, bridge, tunnel from osm_roads_gen0 order by z_order',
    //   { maxZoom: 13 },
    // )
    .sqlLayer('aeroways',
      'select geometry, type from osm_aeroways',
      { minZoom: 11 },
    )
    .sqlLayer('solar_power_plants',
      "select geometry from osm_power_generator_polys where source = 'solar'",
      { minZoom: 12 }
    )
    .sqlLayer('buildings',
      'select geometry, type from osm_buildings',
      { minZoom: 13 },
    )
    .sqlLayer('ruin_polys',
      'select geometry from osm_ruin_polys',
      { minZoom: 13 },
    )
    .sqlLayer('barrierways',
      'select geometry, type from osm_barrierways',
      { minZoom: 16 },
    )
    .doInMap((map) => {
      if (contours) {
        map.sqlLayer('contours',
          'select geom, height from contour_split',
          { minZoom: 12 },
        );
      }
      if (shading) {
        map.layer('hillshade', {
          type: 'gdal',
          file: 'shading/final.tiff',
        });
      }
    })
    .sqlLayer('protected_areas',
      'select type, geometry from osm_protected_areas')
    .sqlLayer('borders',
      'select st_linemerge(st_collect(geometry)) as geometry from osm_admin where admin_level = 2 and geometry && !bbox!',
      { opacity: 0.5 })
    .sqlLayer('military_areas',
      "select geometry from osm_landusages where type = 'military'")
    // .sqlLayer(['routeGlows', 'routes'],
    .sqlLayer('routes',
      routesQuery,
      { minZoom: 11, maxZoom: 13, bufferSize: 512 },
    )
    .sqlLayer('routes',
      routesQuery,
      { minZoom: 14, clearLabelCache: 'on', bufferSize: 2048 }, // NOTE clearing cache because of contour elevation labels
    )
    .layer(
      'geonames',
      {
        type: 'shape',
        file: 'geo-names/geo-names.shp',
      },
      { srs: '+init=epsg:4326', bufferSize: 1024, minZoom: 9, maxZoom: 11 }
    )
    .sqlLayer('placenames',
      "select name, type, geometry from osm_places where type = 'city' AND geometry && !bbox! order by z_order desc, osm_id",
      { bufferSize: 1024, maxZoom: 8, clearLabelCache: 'on' }
    )
    .sqlLayer('placenames',
      "select name, type, geometry from osm_places where (type = 'city' OR type = 'town') AND geometry && !bbox! order by z_order desc, osm_id",
      { bufferSize: 1024, minZoom: 9, maxZoom: 10, clearLabelCache: 'on' }
    )
    .sqlLayer('placenames',
      "select name, type, geometry from osm_places where (type = 'city' OR type = 'town' OR type = 'town' OR type = 'village') AND geometry && !bbox! order by z_order desc, osm_id",
      { bufferSize: 1024, minZoom: 11, maxZoom: 11, clearLabelCache: 'on' }
    )
    .sqlLayer('placenames',
      "select name, type, geometry from osm_places where type <> 'locality' AND geometry && !bbox! order by z_order desc, osm_id",
      { bufferSize: 1024, minZoom: 12, maxZoom: 14, clearLabelCache: 'on' }
    )
    .doInMap((map) => {
      for (let zoom = 10; zoom <= 17; zoom++) {
        map.sqlLayer('features',
          getFeaturesSql(zoom),
          { minZoom: zoom, maxZoom: zoom === 17 ? undefined : zoom, bufferSize: 256, cacheFeatures: true }
        );
      }

      for (let zoom = 10; zoom <= 17; zoom++) {
        map.sqlLayer('feature_names',
          getFeaturesSql(zoom),
          { minZoom: zoom, maxZoom: zoom === 17 ? undefined : zoom, bufferSize: 256, cacheFeatures: true }
        );
      }
    })
    // TODO to feature_names to consider z_order
    .sqlLayer('water_area_names',
      "select name, geometry, type, area from osm_waterareas where type <> 'riverbank'",
      { minZoom: 10, bufferSize: 1024 },
    )
    // TODO/NOTE this renders rest of names - names of unknown feature_polys (not covered in 'feature_names') like: school, kindergarden, recycling
    // TODO what about feature points?
    .sqlLayer('landcover_names',
      'select geometry, name, 1000 as area from osm_feature_polys left join z_order_poi using (type) where geometry && !bbox! order by z_order, area desc, osm_id',
      { minZoom: 12, bufferSize: 1024 },
    )
    // TODO
    // .sqlLayer('feature_line_names',
    //   "select geometry, name, type from osm_feature_lines where type <> 'valley'",
    //   { minZoom: 14 },
    // )
    .sqlLayer(
      'building_names',
      'select name, type, geometry from osm_buildings order by osm_id',
      { bufferSize: 512, minZoom: 17 },
    )
    .sqlLayer(
      'protected_area_names',
      'select type, name, geometry from osm_protected_areas',
      { bufferSize: 1024, minZoom: 8 },
    )
    .sqlLayer('landcover_names',
      'select type, geometry, name, area from osm_landusages left join z_order_landuse using (type) where geometry && !bbox! order by z_order, osm_id',
      { minZoom: 12, bufferSize: 1024, cacheFeatures: true },
    )
    .sqlLayer(
      'locality_names',
      "select name, type, geometry from osm_places where type = 'locality' order by osm_id",
      { minZoom: 15, bufferSize: 1024 },
    )
    .sqlLayer('housenumbers',
      `select coalesce(nullif("addr:streetnumber", ''), nullif("addr:housenumber", ''), nullif("addr:conscriptionnumber", '')) as housenumber, geometry from (
          select * from osm_housenumbers union all select * from osm_housenumbers_poly
        ) as hn_polys where geometry && !bbox!
        `,
      { minZoom: 18, bufferSize: 256 })
    .sqlLayer('highway_names',
      'select name, geometry, type from osm_roads where geometry && !bbox! order by z_order desc, osm_id',
      { minZoom: 15, bufferSize: 1024 },
    )
    .sqlLayer('route_names',
      routesQuery,
      { minZoom: 14, bufferSize: 2048 }, // NOTE probably must be same bufferSize as routes
    )
    .sqlLayer('aerialway_names',
      'select geometry, name, type from osm_aerialways',
      { minZoom: 16, bufferSize: 1024 },
    )
    .sqlLayer('water_line_names',
      `select ${process.env.FM_CUSTOM_SQL || ''} geometry, name, type from osm_waterways`,
      { minZoom: 12, bufferSize: 1024 },
    )
    .sqlLayer('fixmes',
      'select geometry from osm_fixmes',
      { minZoom: 14 },
    )
    .sqlLayer('valleys',
      "select geometry, name from osm_feature_lines where type = 'valley'",
      { minZoom: 13, clearLabelCache: 'on', bufferSize: 1024 },
    )
    .sqlLayer('placenames',
      "select name, type, geometry from osm_places where type <> 'locality' AND geometry && !bbox! order by z_order desc, osm_id",
      { clearLabelCache: 'on', bufferSize: 1024, minZoom: 15 },
    )
    .doInMap(map => {
      if (format !== 'svg' && format !== 'pdf') {
        map.layer('crop',
          { type: 'geojson', file: 'limit.geojson' },
          { srs: '+init=epsg:4326', compOp: 'dst-in' },
        );
      }

      if (custom) {
        for (const style of custom.styles) {
          map.mapEle.ele(style);
        }

        for (const layer of custom.layers) {
          map.layer(
            layer.styles,
            {
              type: 'geojson',
              inline: JSON.stringify(layer.geojson)
            },
            { srs: '+init=epsg:4326' },
          );
        }
      }

      return map;
    })
  ;
}
