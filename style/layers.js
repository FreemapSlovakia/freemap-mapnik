module.exports = { layers };

const towerType = `concat("class", '_', case type
  when 'communication' then 'communication'
  when 'observation' then 'observation'
  else 'other' end) as type`;

function layers(shading, contours, hikingTrails, bicycleTrails /*, skiTrails*/) {
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
      'select geometry, type, tracktype, class, service from osm_roads_gen0 order by z_order',
      { maxZoom: 9 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service from osm_roads_gen1 order by z_order',
      { minZoom: 10, maxZoom: 11 },
    )
    .sqlLayer('highways',
      'select geometry, type, tracktype, class, service from osm_roads_gen1 order by z_order',
      { maxZoom: 11 },
    )
    .sqlLayer(['higwayGlows', 'highways'],
      'select geometry, type, tracktype, class, service from osm_roads order by z_order',
      { minZoom: 12, cacheFeatures: true },
    )
    .sqlLayer('aerialways',
      'select geometry, type from osm_aerialways',
      { minZoom: 12 },
    )
    // .sqlLayer('highways',
    //   'select geometry, type, tracktype, class, service from osm_roads_gen0 order by z_order',
    //   { maxZoom: 13 },
    // )
    .sqlLayer('aeroways',
      'select geometry, type from osm_aeroways',
    )
    .sqlLayer('solar_power_plants',
      "select geometry from osm_power_generator_polys where source = 'solar'",
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
        map.layer('contours', {
          type: 'shape',
          file: 'shading/contours_split.shp',
        }, { minZoom: 12, srs: '+init=epsg:4326' });
      }
      if (shading) {
        map.layer('hillshade', {
          type: 'gdal',
          // file: '/media/martin/data/martin/mapping/dmr20/new/final.tiff',
          file: 'shading/final.tiff',
        });
      }
    })
    .sqlLayer('protected_areas',
      'select type, geometry from osm_protected_areas')
    .sqlLayer('borders',
      'select geometry from osm_admin where admin_level = 2')
    .sqlLayer('military_areas',
      "select geometry from osm_landusages where type = 'military'")
    .sqlLayer('routes',
      `select
        geometry,
        idx(arr, 0) as h_red,
        idx(arr, 1) as h_blue,
        idx(arr, 2) as h_green,
        idx(arr, 3) as h_yellow,
        idx(arr, 4) as h_black,
        idx(arr, 5) as h_white,
        idx(arr, 6) as h_orange,
        idx(arr, 7) as h_purple,
        idx(arr, 10) as h_red_loc,
        idx(arr, 11) as h_blue_loc,
        idx(arr, 12) as h_green_loc,
        idx(arr, 13) as h_yellow_loc,
        idx(arr, 14) as h_black_loc,
        idx(arr, 15) as h_white_loc,
        idx(arr, 16) as h_orange_loc,
        idx(arr, 17) as h_purple_loc,
        idx(arr, 20) as b_red,
        idx(arr, 21) as b_blue,
        idx(arr, 22) as b_green,
        idx(arr, 23) as b_yellow,
        idx(arr, 24) as b_black,
        idx(arr, 25) as b_white,
        idx(arr, 26) as b_orange,
        idx(arr, 27) as b_purple,
        idx(arr, 30) as s_red,
        idx(arr, 31) as s_blue,
        idx(arr, 32) as s_green,
        idx(arr, 33) as s_yellow,
        idx(arr, 34) as s_black,
        idx(arr, 35) as s_white,
        idx(arr, 36) as s_orange,
        idx(arr, 37) as s_purple
      from (
        select
          geometry,
          case
            when osm_routes.type in ('foot', 'hiking') then 'hiking'
            when osm_routes.type in ('bicycle', 'mtb', 'ski', 'piste') then 'bicycleAndSki'
            else null end as groupType,
          uniq(sort(array_agg(
            case
              when osm_routes.type in ('hiking', 'foot') then
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
              when osm_routes.type in (${bicycleTrails ? "'bicycle', 'mtb', " : ''}'ski', 'piste') then
                20 + case when osm_routes.type in ('bicycle', 'mtb') then 0 else 10 end +
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
          ))) as arr from osm_route_members join osm_routes using (osm_id) group by member, groupType, geometry
      ) as aaa`,
      { minZoom: 10, clearLabelCache: 'on' /*, cacheFeatures: true*/ }, // NOTE clearing cache because of contour elevation labels
    )
    .sqlLayer('placenames',
      'select name, type, geometry from osm_places order by z_order desc',
      { bufferSize: 1024, maxZoom: 14 })
    .sqlLayer('feature_points',
      `select * from (
        select case when type = 'peak' then
          case when isolation > 4500 then 'peak1'
            when isolation between 3000 and 4500 then 'peak2'
            when isolation between 1500 and 3000 then 'peak3'
            else 'peak' end else type end, geometry from osm_feature_points natural join isolations
        union all select case type when 'communications_tower' then 'tower_communication' else type end as type, geometry from osm_feature_polys
        union all select type, geometry from osm_shops
        union all select type, geometry from osm_shop_polys
        union all select ${towerType}, geometry from osm_towers
        union all select ${towerType}, geometry from osm_tower_polys
        union all select type, geometry from osm_barrierpoints
        union all select building as type, geometry from osm_place_of_worships
        union all select building as type, geometry from osm_place_of_worship_polys
        union all select type, geometry from osm_transport_points where type = 'bus_stop'
        union all select 'ruins' as type, geometry from osm_ruins
        union all select 'ruins' as type, geometry from osm_ruin_polys
        union all select type, geometry from osm_infopoints) as abc left join zindex using (type)
        order by z`,
      { minZoom: 10 },
    )
    .sqlLayer('feature_point_names',
      `select * from (
        select case when type = 'peak' then
          case when isolation > 4500 then 'peak1'
            when isolation between 3000 and 4500 then 'peak2'
            when isolation between 1500 and 3000 then 'peak3'
            else 'peak' end else type end, geometry, name, ele from osm_feature_points natural join isolations
        union all select case type when 'communications_tower' then 'tower_communication' else type end as type, geometry, name, ele from osm_feature_polys
        union all select type, geometry, name, null as ele from osm_shops
        union all select type, geometry, name, null as ele from osm_shop_polys
        union all select ${towerType}, geometry, name, ele from osm_towers
        union all select ${towerType}, geometry, name, ele from osm_tower_polys
        union all select building as type, geometry, name, null as ele from osm_place_of_worships
        union all select building as type, geometry, name, null as ele from osm_place_of_worship_polys
        union all select type, geometry, name, null as ele from osm_transport_points where type = 'bus_stop'
        union all select 'ruins' as type, geometry, name, null from osm_ruins
        union all select 'ruins' as type, geometry, name, null from osm_ruin_polys
        union all select type, geometry, name, ele from osm_infopoints) as abc left join zindex using (type)
        order by z`,
      { minZoom: 10 },
    )
    .sqlLayer('highway_names',
      'select name, geometry, type from osm_roads order by z_order desc',
      { minZoom: 15 },
    )
    .sqlLayer('aerialway_names',
      'select geometry, name, type from osm_aerialways',
      { minZoom: 16 },
    )
    .sqlLayer('water_line_names',
      'select geometry, name, type from osm_waterways',
      { minZoom: 12 },
    )
    // TODO to feature_point_names to consider zindex
    .sqlLayer('water_area_names',
      "select name, geometry, type, area from osm_waterareas where type <> 'riverbank'",
      { minZoom: 10 },
    )
    .sqlLayer('feature_line_names',
      'select geometry, name, type from osm_feature_lines',
      { minZoom: 14 },
    )
    // TODO to feature_point_names to consider zindex
    .sqlLayer('aeroport_names',
      "select name, geometry from osm_transport_areas where type = 'aerodrome'",
      { minZoom: 12 },
    )
    .sqlLayer('building_names',
      'select name, type, geometry from osm_buildings')
    .sqlLayer('protected_area_names',
      'select type, name, geometry from osm_protected_areas')
    .sqlLayer('locality_names',
      "select name, type, geometry from osm_places where type = 'locality'",
      { minZoom: 15 },
    )
    .sqlLayer('fixmes',
      'select geometry from osm_fixmes',
      { minZoom: 14 },
    )
    .sqlLayer('placenames',
      'select name, type, geometry from osm_places order by z_order desc',
      { clearLabelCache: 'on', bufferSize: 1024, minZoom: 15 },
    );
}
