module.exports = { layers };

function getFeaturesSql(zoom) {
  const sqls = [`select * from (
    select
      osm_id,
      geometry,
      name,
      tags->'ele' as ele,
      case when isolation > 4500 then 'peak1'
        when isolation between 3000 and 4500 then 'peak2'
        when isolation between 1500 and 3000 then 'peak3'
        else 'peak' end as type,
      isolation,
      null as access
    from
      osm_features
    natural left join
      isolations
    where
      type = 'peak' and name <> '' and geometry && !bbox!`];

  if (zoom >= 12) {
    sqls.push(`
      union all
        select
          osm_id,
          geometry,
          name,
          ele,
          case type
            when 'guidepost' then (case when name = '' then 'guidepost_noname' else 'guidepost' end)
            else type
            end as type,
          null as isolation,
          null as access
        from
          osm_infopoints
    `);
  }

  if (zoom >= 12 && zoom < 14) {
    sqls.push(`
      union all
        select
          osm_id,
          geometry,
          name,
          tags->'ele' as ele,
          type,
          null as isolation,
          null as access
        from
          osm_features
        where
          type = 'aerodrome' and tags ? 'icao'

      union all
        select
          osm_id,
          geometry,
          name,
          tags->'ele' as ele,
          type,
          null as isolation,
          null as access
        from
          osm_feature_polys
        where
          type = 'aerodrome' and tags ? 'icao'
    `);
  }

  if (zoom >= 14) {
    // TODO distinguish various "spring types" (fountain, geyser, ...)

    sqls.push(`
      union all
        select
          osm_id,
          geometry,
          name,
          null as ele,
          type,
          null as isolation,
          tags->'access' as access
        from
          osm_sports
        where
          type in ('free_flying', 'soccer', 'tennis', 'basketball')

      union all
        select
          osm_id,
          geometry,
          name,
          tags->'ele' as ele,
          case type
            when 'communications_tower' then 'tower_communication'
            when 'shelter' then (case when tags->'shelter_type' in ('shopping_cart', 'lean_to', 'public_transport', 'picnic_shelter', 'basic_hut', 'weather_shelter') then tags->'shelter_type' else 'shelter' end)
            else (case when type in ('mine', 'adit', 'mineshaft') and tags->'disused' not in ('', 'no') then 'disused_mine' else type end)
            end as type,
          null as isolation,
          case when type in ('cave_entrance') then null else tags->'access' end as access
        from
          osm_features
        where
          type <> 'peak'
            and (type <> 'tree' or tags->'protected' not in ('', 'no'))
            and (type <> 'saddle' or name <> '')

      union all
        select
          osm_id,
          geometry,
          name,
          tags->'ele' as ele,
          case type when 'communications_tower' then 'tower_communication'
            when 'shelter' then (case when tags->'shelter_type' in ('shopping_cart', 'lean_to', 'public_transport', 'picnic_shelter', 'basic_hut', 'weather_shelter') then tags->'shelter_type' else 'shelter' end)
            else (case when type in ('mine', 'adit', 'mineshaft') and tags->'disused' not in ('', 'no') then 'disused_mine' else type end)
            end as type,
          null as isolation,
          case when type in ('cave_entrance') then null else tags->'access' end as access
        from
          osm_feature_polys

      union all
        select
          osm_id,
          geometry,
          name,
          ele,
            case when type = 'hot_spring' then 'hot_spring' else
            case when type = 'spring_box' or refitted = 'yes' then 'refitted_' else '' end ||
            case when drinking_water = 'yes' or drinking_water = 'treated' then 'drinking_' when drinking_water = 'no' then 'not_drinking_' else '' end || 'spring'
          end as type,
          null as isolation,
          null as access
        from
          osm_springs

      union all
        select
          osm_id,
          geometry,
          name,
          null as ele,
          'ruins' as type,
          null as isolation,
          null as access
        from
          osm_ruins

      union all
        select
          osm_id,
          geometry,
          name,
          null as ele,
          building as type,
          null as isolation,
          null as access
        from
          osm_place_of_worships
        where
          building in ('chapel', 'church', 'basilica', 'temple')

      union all
        select
          osm_id, geometry, name, ele,
          concat("class", '_', case type
            when 'communication' then 'communication'
            when 'observation' then 'observation'
            when 'bell_tower' then 'bell_tower'
            else 'other' end) as type,
          null as isolation,
          null as access
          from
            osm_towers
    `);
  }

  if (zoom >= 15) {
    sqls.push(`
      union all
        select
          osm_id,
          geometry,
          name,
          null as ele,
          type,
          null as isolation,
          null as access
        from
          osm_shops
        where
          type in ('convenience', 'fuel', 'confectionery', 'pastry', 'bicycle', 'supermarket')

      union all
        select
          osm_id,
          geometry,
          name,
          null as ele,
          'building' as type,
          null as isolation,
          tags->'access' as access
        from
          osm_building_points
        where
          type <> 'no'
    `);
  }

  if (zoom >= 17) {
    sqls.push(`
      union all
        select
          osm_id,
          geometry,
          name,
          null as ele,
          type,
          null as isolation,
          null as access
        from
          osm_barrierpoints
        where
          type in ('lift_gate', 'swing_gate', 'gate')
    `);
  }

  sqls.push(`
    ) as abc left join z_order_poi using (type)
    where
      geometry && !bbox!
    order
      by z_order, isolation desc nulls last, ele desc nulls last, osm_id
  `);

  return sqls.join('');
}

const landuseZOrder = "position(type || ',' in 'pedestrian,footway,pitch,library,baracks,parking,cemetery,place_of_worship,clearcut,scrub,orchard,vineyard,landfill,scree,quarry,railway,park,garden,allotments,kindergarten,school,college,university,village_green,wetland,grass,recreation_ground,zoo,farmyard,retail,commercial,residential,industrial,fell,bare_rock,heath,meadow,wood,forest,golf_course,grassland,farm,farmland,') as z_order";

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
      `select type, geometry, ${landuseZOrder} from osm_landusages_gen0 where geometry && !bbox! order by z_order desc, osm_id`,
      { maxZoom: 9 },
    )
    .sqlLayer('landcover',
      `select type, geometry, ${landuseZOrder} from osm_landusages_gen1 where geometry && !bbox! order by z_order desc, osm_id`,
      { minZoom: 10, maxZoom: 11 },
    )
    .sqlLayer('landcover',
      `select type, geometry, ${landuseZOrder} from osm_landusages where geometry && !bbox! order by z_order desc, osm_id`,
      { minZoom: 12, cacheFeatures: true },
    )
    .sqlLayer('cutlines',
      "select geometry, type from osm_feature_lines where type = 'cutline'",
      { minZoom: 13 },
    )
    .sqlLayer('water_area',
      'select geometry, type, intermittent OR seasonal as tmp from osm_waterareas_gen1',
      { maxZoom: 11 },
    )
    .sqlLayer('water_area',
      'select geometry, type, intermittent OR seasonal as tmp from osm_waterareas',
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
      "select type, geometry from osm_features where type = 'tree' OR type = 'shrub'",
      { minZoom: 16, bufferSize: 128 },
    )
    // TODO split to several layers: underground/underwater, overground, overhead
    .sqlLayer('pipelines',
      'select geometry, location from osm_pipelines',
      { minZoom: 13 },
    )
    .sqlLayer('feature_lines',
      "select geometry, type from osm_feature_lines where type not in ('cutline', 'valley', 'ridge')",
      { minZoom: 13, cacheFeatures: true },
    )
    .doInMap((map) => {
      if (shading) {
        map.sqlLayer('feature_lines_maskable',
          "select geometry, type from osm_feature_lines where type not in ('cutline', 'valley', 'ridge')", // TODO for effectivity filter out cliffs/earth_banks
          { minZoom: 13, compOp: 'src-over' },
          ({ layer }) => {
            layer(
              'mask',
              {
                type: 'gdal',
                file: 'shading/sk-dmr5-mask.tif',
              },
              { compOp: 'dst-out' },
            );
          }
        );
      } else {
        map.sqlLayer('feature_lines_maskable',
          "select geometry, type from osm_feature_lines where type not in ('cutline', 'valley', 'ridge')",
          { minZoom: 13, cacheFeatures: true },
        );
      }
    })
    .sqlLayer('embankments',
      'select geometry from osm_roads where embankment = 1 and geometry && !bbox!',
      { minZoom: 16 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) as trail_visibility from osm_roads_gen0 where geometry && !bbox! order by z_order, osm_id',
      { maxZoom: 9, groupBy: 'tunnel' },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) as trail_visibility from osm_roads_gen1 where geometry && !bbox! order by z_order, osm_id',
      { minZoom: 10, maxZoom: 11, groupBy: 'tunnel' },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) as trail_visibility from osm_roads_gen1 where geometry && !bbox! order by z_order, osm_id',
      { maxZoom: 11, groupBy: 'tunnel' },
    )
    .sqlLayer(['higwayGlows', 'highways'],
      // order bycase when type = 'rail' AND (service = 'main' OR service = '') then 1000 else z_order end
      'select geometry, type, tracktype, class, service, bridge, tunnel, oneway, power(0.666, greatest(0, trail_visibility - 1)) as trail_visibility from osm_roads where geometry && !bbox! order by z_order, osm_id',
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
    //   'select geometry, type, tracktype, class, service, bridge, tunnel, oneway from osm_roads_gen0 order by z_order',
    //   { maxZoom: 13 },
    // )
    .sqlLayer('aeroways',
      'select geometry, type from osm_aeroways',
      { minZoom: 11 },
    )
    .sqlLayer('solar_power_plants',
      "select geometry from osm_power_generators where source = 'solar'",
      { minZoom: 12 }
    )
    .sqlLayer('buildings',
      "select geometry, type from osm_buildings  where type <> 'no'",
      { minZoom: 13 },
    )
    .sqlLayer('barrierways',
      'select geometry, type from osm_barrierways',
      { minZoom: 16 },
    )
    .doInMap((map) => {
      if (shading || contours) {
        // map.layer('hillshade', {
        //   type: 'gdal',
        //   // file: '/home/martin/fm/dmr5/build/final.tif',
        //   file: 'shading/final.tiff',
        //   // file: '/media/martin/ecf9e826-7b6b-4992-adad-71232022b316/martin/dmr5/w/out.vrt',
        //   // file: '/media/martin/ecf9e826-7b6b-4992-adad-71232022b316/martin/dmr5/w/build/final.tif',
        //   // file: '/media/martin/ecf9e826-7b6b-4992-adad-71232022b316/martin/dmr5/w/build/M.tif',
        // });

        // render sk-dmr5; use mask because mapnik has issues with no-data
        map.layer('mask', {
          type: 'gdal',
          file: 'shading/sk-dmr5-mask.tif',
        }, { compOp: 'src-over' }, {}, ({layer}) => {
          layer(
            'sea', // any
            {
              table: '(select wkb_geometry from cont_dmr5_split limit 0) as foo', // some empty data
            },
            { compOp: 'src-in' },
            { base: 'db' },
            ({ layer }) => {
              if (contours) {
                layer(
                  'contours',
                  {
                    table: '(select wkb_geometry, height from cont_dmr5_split) as foo',
                  },
                  {
                    minZoom: 12,
                  },
                  { base: 'db' }
                );
              }

              if (shading) {
                layer(
                  'hillshade',
                  {
                    type: 'gdal',
                    file: 'shading/sk-dmr5.tif',
                  },
                  { },
                  { },
                );
              }
            }
          );
        });

        map.layer(
          'sea', // any
          {
            table: '(select geom from contour_split limit 0) as foo', //  // some empty data
          },
          { compOp: 'src-over' },
          { base: 'db' },
          ({ layer }) => {
            // to cut out area of sk-dmr5
            layer(
              'mask',
              {
                type: 'gdal',
                file: 'shading/sk-dmr5-mask.tif',
              },
              {},
            );

            layer(
              'sea', // any
              {
                table: '(select geom from contour_split limit 0) as foo', //  // some empty data
              },
              { compOp: 'src-out' },
              { base: 'db' },
              ({ layer }) => {
                if (contours) {
                  layer(
                    'contours',
                    {
                      table: '(select geom, height from contour_split) as foo',
                    },
                    {
                      minZoom: 12,
                    },
                    { base: 'db' }
                  );
                }

                if (shading) {
                  layer(
                    'hillshade',
                    {
                      type: 'gdal',
                      file: 'shading/final.tiff',
                    },
                    { },
                    { },
                  );
                }
              },
            );

          },
        );
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
          `SELECT DISTINCT ON (osm_id) * FROM (${getFeaturesSql(zoom)}) subq`,
          { minZoom: zoom, maxZoom: zoom === 17 ? undefined : zoom, bufferSize: 256, cacheFeatures: true }
        );
      }
    })
    // TODO to feature_names to consider z_order
    .sqlLayer('water_area_names',
      `select
          osm_waterareas.name,
          osm_waterareas.geometry,
          osm_waterareas.type,
          osm_waterareas.area
        from
          osm_waterareas left join osm_feature_polys using (osm_id)
        where
          osm_feature_polys.osm_id IS NULL AND
          osm_waterareas.type <> 'riverbank'`,
      { minZoom: 10, bufferSize: 1024 },
    )
    // TODO
    // .sqlLayer('feature_line_names',
    //   "select geometry, name, type from osm_feature_lines where type <> 'valley'",
    //   { minZoom: 14 },
    // )
    .sqlLayer(
      'building_names',
      `select
        osm_buildings.name, osm_buildings.geometry
        from osm_buildings
        left join osm_landusages using (osm_id)
        left join osm_feature_polys using (osm_id)
        left join osm_features using (osm_id)
        left join osm_place_of_worships using (osm_id)
        left join osm_sports using (osm_id)
        left join osm_ruins using (osm_id)
        left join osm_towers using (osm_id)
        where
          osm_buildings.type <> 'no'
            and osm_landusages.osm_id is null
            and osm_feature_polys.osm_id is null
            and osm_features.osm_id is null
            and osm_place_of_worships.osm_id is null
            and osm_sports.osm_id is null
            and osm_ruins.osm_id is null
            and osm_towers.osm_id is null
        order by osm_buildings.osm_id`,
      { bufferSize: 512, minZoom: 17 },
    )
    .sqlLayer(
      'protected_area_names',
      'select type, name, geometry from osm_protected_areas',
      { bufferSize: 1024, minZoom: 8 },
    )
    .sqlLayer('landcover_names_natural',
      `select type, geometry, name, area
        from osm_landusages left join z_order_landuse using (type)
        where geometry && !bbox! and type in ('forest', 'wood', 'scrub', 'heath', 'grassland', 'scree', 'meadow', 'fell')
        order by z_order, osm_id`,
      { minZoom: 12, bufferSize: 1024 },
    )
    .sqlLayer('landcover_names',
      `select type, geometry, name, area
        from osm_landusages left join z_order_landuse using (type)
        where geometry && !bbox! and type not in ('forest', 'wood', 'scrub', 'heath', 'grassland', 'scree', 'meadow', 'fell') and type <> 'golf_course'
        order by z_order, osm_id`,
      { minZoom: 12, bufferSize: 1024 },
    )
    .sqlLayer(
      'locality_names',
      "select name, type, geometry from osm_places where type = 'locality' order by osm_id",
      { minZoom: 15, bufferSize: 1024 },
    )
    .sqlLayer('housenumbers',
      `select coalesce(nullif("addr:streetnumber", ''), nullif("addr:housenumber", ''), nullif("addr:conscriptionnumber", '')) as housenumber, geometry
        from osm_housenumbers where geometry && !bbox!`,
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
    .sqlLayer('valleys_ridges',
      "select geometry, name, 0.8 as offset_factor from osm_feature_lines where type = 'valley' and name <> ''",
      { minZoom: 13, clearLabelCache: 'on', bufferSize: 1024 },
    )
    .sqlLayer('valleys_ridges',
      "select geometry, name, 0 as offset_factor from osm_feature_lines where type = 'ridge' and name <> ''",
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
