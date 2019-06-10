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
    map.style('highways')
      .rule({ filter: "[class] = 'railway' and [type] = 'rail' and ([service] = 'main' or [service] = '')" })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 3 })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 6.5, strokeDasharray: '0,3,3.5,3' })
        .lineSymbolizer({ stroke: 'black', strokeWidth: 1.5 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: 5, strokeDasharray: '0,4,1.5,4' })
      .rule({
        minZoom: 13,
        filter: `[class] = 'railway' and ([type] = 'rail' and [service] != 'main' and [service] != '' or ${types('light_rail', 'tram')})`,
      })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 2.5 })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 6, strokeDasharray: '0,3,3,3' })
        .lineSymbolizer({ stroke: hsl(0, 0, 20), strokeWidth: 1 })
        .lineSymbolizer({ stroke: hsl(0, 0, 20), strokeWidth: 4.5, strokeDasharray: '0,4,1,4' })
      .rule({
        minZoom: 13,
        filter: `[class] = 'railway' and (${types('miniature', 'monorail', 'funicular', 'narrow_gauge', 'subway')})`,
      })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 2.5 })
        .lineSymbolizer({ stroke: hsl(0, 0, 25), strokeWidth: 1.5 })
        .lineSymbolizer({ stroke: hsl(0, 0, 25), strokeWidth: 5, strokeDasharray: '1.5,8.5' })
      .rule({
        minZoom: 14,
        filter: `[class] = 'railway' and (${types('construction', 'disused', 'preserved')})`,
      })
        .lineSymbolizer({ stroke: 'white', strokeWidth: 2.5 })
        .lineSymbolizer({ stroke: hsl(0, 0, 33), strokeWidth: 1.5 })
        .lineSymbolizer({ stroke: hsl(0, 0, 33), strokeWidth: 5, strokeDasharray: '1.5,8.5' })

      .doInStyle((style) => {
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

      .typesRule(12, 'motorway', 'trunk', 'motorway_link', 'trunk_link')
        .lineSymbolizer({ ...highwayDflt, stroke: colors.road, strokeWidth: 2.5 })
      .typesRule(12, 'primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link')
        .lineSymbolizer({ ...highwayDflt, stroke: colors.road, strokeWidth: 1.5 })
      .typesRule(12, 14, 'living_street', 'residential', 'unclassified', 'road')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1 }) // NOTE used to be 1.5
      .typesRule(14, 'living_street', 'residential', 'unclassified', 'road')
        .lineSymbolizer({ ...highwayDflt, stroke: colors.road, strokeWidth: 1 })
      .rule({ filter: "[type] = 'service' and [service] = 'parking_aisle'", minZoom: 14 })
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1 })
      .typesRule(14, 'footway', 'pedestrian', 'steps', 'platform')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 1, strokeDasharray: '4,2' })
      .doInStyle((style) => {
        const w = [0.5, 0.75, 1];
        const zz = [[12, 12], [13, 13], [14]];
        for (const a of [0, 1, 2]) {
          const k = w[a];
          style
            .rule({ minZoom: zz[a][0], maxZoom: zz[a][1], filter: "[type] = 'service' and [service] != 'parking_aisle'" })
              .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1.2 })
            .typesRule(...zz[a], 'path')
              .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '3,3' })
            .typesRule(...zz[a], 'cycleway')
              .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1, strokeDasharray: '6,3' })
            .doInStyle((style) => {
              [undefined, '8,2', '6,4', '4,6', '2,8', '3,7,7,3'].forEach((strokeDasharray, i) => {
                style
                  .rule({
                      filter: `[type] = 'track' and [tracktype] = ${i === 5 ? "''" : `'grade${i + 1}'`}`,
                      minZoom: zz[a][0],
                      maxZoom: zz[a][1],
                  })
                    .lineSymbolizer({ ...highwayDflt, strokeWidth: k * 1.2, strokeDasharray });
              });
            });
        }
      })
    .style('higwayGlows')
      .typesRule(14, 'footway', 'pedestrian', 'steps', 'platform')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .typesRule(12, 'path')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1 })
      .typesRule(12, 'track')
        .lineSymbolizer({ ...glowDflt, strokeWidth: 1.2 })
      .typesRule('motorway', 'trunk', 'motorway_link', 'trunk_link')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 4 })
      .typesRule('primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link', 'tertiary_link')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 3 })
      .typesRule(14, 'living_street', 'residential', 'unclassified', 'road')
        .lineSymbolizer({ ...highwayDflt, strokeWidth: 2.5 });
  };
}
