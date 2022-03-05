const { font } = require('./fontFactory');

const extensions = {
  style: {
    typesRule(style, ...t) {
      const q = [...t];

      let minZoom, maxZoom;

      if (typeof q[0] === 'number' || typeof q[0] === 'undefined') {
        minZoom = q.shift();
      }

      if (typeof q[0] === 'number' || typeof q[0] === 'undefined') {
        maxZoom = q.shift();
      }

      return style.rule({ filter: types(...q), minZoom, maxZoom });
    },
    poiIcons(style, pois) {
      for (const [minIcoZoom, , , , type, extra = {}] of pois) {
        if (typeof minIcoZoom !== 'number') {
          continue;
        }

        const types = Array.isArray(type) ? type : [type];

        const zoom = [minIcoZoom];

        if (extra.maxZoom) {
          zoom.push(extra.maxZoom);
        }

        const r = style.typesRule(...zoom, ...types);

        for (const transform of [undefined, 'translate(6 - (abs([osm_id]) % 2) * 12, 0)', 'translate(-6 + (abs([osm_id]) % 2) * 12, 0)']) {
          if (extra.icon !== null) {
            // TODO find out a way to make it red if private
            r.markersSymbolizer({ multiPolicy: 'whole', file: `images/${extra.icon || types[0]}.svg`, opacity: '1 - ([access] = "private" || [access] = "no") * 0.66', transform });
          }
        }
      }

      return style; // TODO remove
    },
    poiNames(style, pois) {
      for (const [, minTextZoom, withEle, natural, type, extra = {}] of pois) {
        if (typeof minTextZoom !== 'number') {
          continue;
        }

        const fnt = font()
          .wrap()
          .if(natural, f => f.nature())
          .end({ placementType: 'list', dy: -10, ...(extra.font || {}) });

        const { textSymbolizerEle } = style
          .rule({ filter: types(...Array.isArray(type) ? type : [type]), minZoom: minTextZoom, maxZoom: extra.maxZoom })
          .textSymbolizer(fnt, withEle ? undefined : '[name]')
          .placement({ dy: extra && extra.font && extra.font.dy ? -extra.font.dy : 10 });

        if (withEle) {
          textSymbolizerEle.text('[name]');
          textSymbolizerEle.ele('Format', { size: fnt.size * 0.92 }, '[elehack]');
          textSymbolizerEle.ele('Format', { size: fnt.size * 0.8 }, '[ele]');
        }
      }

      return style; // TODO remove
    },
    area(style, color, ...types) {
      return style.typesRule(...types)
        .borderedPolygonSymbolizer(color);
    }
  },
  textSymbolizer: {
    placements(textSymbolizer) {
      for (const off of [3, 6, 9]) {
        textSymbolizer.placement({ dy: off }).placement({ dy: -off });
      }

      return textSymbolizer;
    }
  },
  rule: {
    borderedPolygonSymbolizer(rule, color) {
      return rule
        .polygonSymbolizer({ fill: color })
        .lineSymbolizer({ stroke: color, strokeWidth: 1 });
    },
    rail(rule, { color, weight, sleeperWeight, spacing, glowWidth }) {
      const gw = weight + glowWidth * 2;

      const sgw = sleeperWeight + glowWidth * 2;

      if (glowWidth) {
        rule
          .lineSymbolizer({ stroke: 'white', strokeWidth: gw })
          .lineSymbolizer({ stroke: 'white', strokeWidth: sgw, strokeDasharray: `0,${(spacing - gw) / 2},${gw},${(spacing - gw) / 2}` });
      }

      rule
        .lineSymbolizer({ stroke: color, strokeWidth: weight })
        .lineSymbolizer({ stroke: color, strokeWidth: sleeperWeight, strokeDasharray: `0,${(spacing - weight) / 2},${weight},${(spacing - weight) / 2}` })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[bridge]', offset: sgw / 2 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[bridge]', offset: - sgw / 2 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[tunnel]', offset: sgw / 2, strokeDasharray: '3,3', strokeOpacity: 0.5 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[tunnel]', offset: - sgw / 2, strokeDasharray: '3,3', strokeOpacity: 0.5 })
        .lineSymbolizer({ strokeOpacity: 0.8, stroke: '#ccc', strokeWidth: `[tunnel] * ${sgw}` });

      return rule;
    },
    road(rule, props) {
      return rule
        .lineSymbolizer(props)
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[bridge]', offset: props.strokeWidth / 2 + 1 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[bridge]', offset: - props.strokeWidth / 2 - 1 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[tunnel]', offset: props.strokeWidth / 2 + 1, strokeDasharray: '3,3', strokeOpacity: 0.5 })
        .lineSymbolizer({ stroke: 'black', strokeWidth: '[tunnel]', offset: - props.strokeWidth / 2 - 1, strokeDasharray: '3,3', strokeOpacity: 0.5 })
        .lineSymbolizer({ strokeOpacity: 0.8, stroke: '#ccc', strokeWidth: `[tunnel] * ${props.strokeWidth + 2}` });
    }
  },
  map: {
    sqlLayer(map, styleName, sql, atts = {}, nestedLayerFactory) {
      const dsParams = {
        table: `(${sql}) as foo`,
        geometry_field: 'geometry'
      };
      return map.layer(styleName, dsParams, atts, { base: 'db' }, nestedLayerFactory);
    },
  }
};

function types(...type) {
  return type.map((x) => `[type] = '${x.replace("'", "\\'")}'`).join(' or ');
}

module.exports = { extensions, types };
