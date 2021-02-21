/* eslint-disable indent */
const { colors, hsl } = require('./colors');
const { types } = require('./jsnikExtensions');

const glowDflt = { stroke: hsl(0, 33, 70)};
const highwayDflt = { stroke: colors.track };

module.exports = {
  highways,
};

function highways() {
  return (map) => {
    map
      .style('highways')
        .typesRule(14, 'pier')
          .lineSymbolizer({ stroke: 'black', strokeWidth: 2 })
        .rule({ minZoom: 12, filter: "[class] = 'railway' and [type] = 'rail' and ([service] = 'main' or [service] = '')" })
          .rail({ color: 'black', weight: 1.5, sleeperWeight: 5, spacing: 9.5, glowWidth: 1 })
        .rule({
          minZoom: 13,
          filter: `[class] = 'railway' and ([type] = 'rail' and [service] != 'main' and [service] != '' or ${types('light_rail', 'tram')})`,
        })
          .rail({ color: hsl(0, 0, 20), weight: 1, sleeperWeight: 4.5, spacing: 9.5, glowWidth: 1 })
        .rule({
          minZoom: 13,
          filter: `[class] = 'railway' and (${types('miniature', 'monorail', 'funicular', 'narrow_gauge', 'subway')})`,
        })
          .rail({ color: hsl(0, 0, 20), weight: 1, sleeperWeight: 4.5, spacing: 7.5, glowWidth: 1 })
        .rule({
          minZoom: 14,
          filter: `[class] = 'railway' and (${types('construction', 'disused', 'preserved')})`,
        })
          .rail({ color: hsl(0, 0, 33), weight: 1, sleeperWeight: 4.5, spacing: 7.5, glowWidth: 1 })

        .doInStyle((style) => {
          for (let z = 8; z <= 11; z++) {
            const koef = 0.8 * Math.pow(1.15, z - 8);

            style
              .rule({ minZoom: z, maxZoom: z, filter: "[class] = 'railway' and [type] = 'rail' and ([service] = 'main' or [service] = '')" })
                .rail({ color: 'black', weight: koef, sleeperWeight: 10 / 3 * koef, spacing: 9.5 / 1.5 * koef, glowWidth: 0.5 * koef });
          }
          for (let z = 8; z <= 11; z++) {
            const koef = 0.5 * Math.pow(1.5, z - 8);
            style
              .typesRule(z, z, 'motorway', 'trunk', 'motorway_link', 'trunk_link')
                .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.6 * koef })
              .typesRule(z, z, 'primary', 'primary_link')
                .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.4 * koef })
              .typesRule(z, z, 'secondary', 'secondary_link')
                .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.2 * koef })
              .typesRule(z, z,'tertiary', 'tertiary_link')
                .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.0 * koef })
              ;
          }
        })

        .typesRule(12, 'motorway', 'trunk')
          .road({ ...highwayDflt, stroke: colors.road, strokeWidth: 2.5 })
        .typesRule(12, 'motorway_link', 'trunk_link', 'primary')
          .road({ ...highwayDflt, stroke: colors.road, strokeWidth: 1.5 + 2/3 })
        .typesRule(12, 'primary_link', 'secondary')
          .road({ ...highwayDflt, stroke: colors.road, strokeWidth: 1.5 + 1/3 })
        .typesRule(12, 'construction')
          .road({ ...highwayDflt, stroke: 'yellow', strokeWidth: 1.5 + 1/3, strokeDasharray: '5,5' })
          .road({ ...highwayDflt, stroke: '#666', strokeWidth: 1.5 + 1/3, strokeDasharray: '0,5,5,0' })
        .typesRule(12, 'secondary_link', 'tertiary', 'tertiary_link')
          .road({ ...highwayDflt, stroke: colors.road, strokeWidth: 1.5 })
        .typesRule(12, 14, 'living_street', 'residential', 'unclassified', 'road')
          .road({ ...highwayDflt, strokeWidth: 1 })
        .typesRule(14, 'living_street', 'residential', 'unclassified', 'road')
          .road({ ...highwayDflt, stroke: colors.road, strokeWidth: 1 })
        .typesRule(14, 'water_slide')
          .road({ ...highwayDflt, stroke: hsl(180, 50, 50), strokeWidth: 1.5 })
        .rule({ minZoom: 14, filter: "[type] = 'service' and [service] = 'parking_aisle'" })
          .road({ ...highwayDflt, strokeWidth: 1 })
        .typesRule(14, 'raceway')
          .road({ ...highwayDflt, strokeWidth: 1.2, strokeDasharray: '9.5,1.5' })
        .typesRule(14, 'bridleway')
          .lineSymbolizer({ ...highwayDflt, strokeWidth: 1.2, stroke: hsl(120, 50, 30), strokeDasharray: '6,3' })
        .typesRule(14, 'piste')
          .road({ ...highwayDflt, strokeWidth: 1.2, stroke: 'white' })
        .typesRule(14, 'footway', 'pedestrian', 'steps', 'platform')
          .road({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
        .doInStyle((style) => {
          const w = [0.5, 0.75, 1];
          const zz = [[12, 12], [13, 13], [14]];
          for (const a of [0, 1, 2]) {
            const k = w[a];
            style
              .rule({ minZoom: zz[a][0], maxZoom: zz[a][1], filter: "[type] = 'service' and [service] != 'parking_aisle' or [type] = 'escape' or [type] = 'corridor' or [type] = 'bus_guideway'" })
                .road({ ...highwayDflt, strokeWidth: k * 1.2 })
              .typesRule(...zz[a], 'path')
                .road({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '3,3' })
              .typesRule(...zz[a], 'cycleway')
                .road({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '6,3' })
              .typesRule(...zz[a], 'via_ferrata')
                .road({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '4,4' })
              .doInStyle((style) => {
                [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
                  style
                    .rule({
                        filter: `[type] = 'track' and [tracktype] = ${i === 5 ? "''" : `'grade${i + 1}'`}`,
                        minZoom: zz[a][0],
                        maxZoom: zz[a][1],
                    })
                      .road({ ...highwayDflt, strokeWidth: k * 1.2, strokeDasharray });
                });
              });
          }
        })
      .style('higwayGlows')
        .typesRule(14, 'footway', 'pedestrian', 'steps', 'platform')
          .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
        .typesRule(14, 'via_ferrata')
        .lineSymbolizer({ stroke: 'black', strokeWidth: 3, strokeDasharray: '0,4,4,0' })
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
        .typesRule(12, 'path')
          .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
        .typesRule(12, 'track')
          .lineSymbolizer({ ...glowDflt, strokeWidth: 1.2 })
        .typesRule(14, 'raceway')
          .lineSymbolizer({ ...glowDflt, strokeWidth: 1.2 })
        .typesRule(14, 'bridleway')
          .lineSymbolizer({ ...glowDflt, strokeWidth: 1.2,stroke: hsl(120, 50, 80) })
        .typesRule('motorway', 'trunk')
          .lineSymbolizer({ ...highwayDflt, strokeWidth: 4 })
        .typesRule('primary', 'motorway_link', 'trunk_link')
          .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 + 2/3 })
        .typesRule('primary_link', 'secondary', 'construction')
          .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 + 1/3 })
        .typesRule('secondary_link', 'tertiary', 'tertiary_link')
          .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
        .typesRule(14, 'living_street', 'residential', 'unclassified', 'road')
          .lineSymbolizer({ ...highwayDflt, strokeWidth: 2.5 })
        .typesRule(14, 'piste')
          .road({ ...highwayDflt, strokeWidth: 2.2, stroke: '#a0a0a0', strokeDasharray: '6,2',  })
        .style('accessRestrictions')
          .rule({ filter: '[no_bicycle] = 1' })
            .markersSymbolizer({ file: 'images/no_bicycle.svg', spacing: 48, placement: 'line', opacity: 0.75, ignorePlacement: true })
          .rule({ filter: '[no_foot] = 1' })
            .markersSymbolizer({ file: 'images/no_foot.svg', spacing: 48, spacingOffset: 0, placement: 'line', opacity: 0.75, ignorePlacement: true })
      ;
  };
}
