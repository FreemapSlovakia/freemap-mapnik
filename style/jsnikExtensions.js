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
        style.typesRule(...zoom, ...types)
          .markersSymbolizer({ file: `images/${extra.icon || types[0]}.svg` });
      }
      return style; // TODO remove
    },
    poiNames(style, pois) {
      for (const [, minTextZoom, withEle, natural, type, extra = {}] of pois) {
        if (typeof minTextZoom !== 'number') {
          continue;
        }
        const types = Array.isArray(type) ? type : [type];

        const fnt = font().wrap().if(natural, f => f.nature()).end({ dy: -10, ...(extra.font || {}) });
        const { textSymbolizerEle } = style
          .typesRule(minTextZoom, ...types)
          .textSymbolizer(fnt,
            withEle ? undefined : '[name]');
        if (withEle) {
          textSymbolizerEle.text('[name] + "\n"');
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
        .lineSymbolizer({ stroke: color, strokeWidth: sleeperWeight, strokeDasharray: `0,${(spacing - weight) / 2},${weight},${(spacing - weight) / 2}` });
      return rule;
    },
  },
  map: {
    sqlLayer(map, styleName, sql, atts = {}, nestedLayerFactory) {
      const dsParams = {
        table: `(${sql}) as foo`,
      };
      return map.layer(styleName, dsParams, atts, { base: 'db' }, nestedLayerFactory);
    },
  }
};

function types(...type) {
  return type.map((x) => `[type] = '${x}'`).join(' or ');
}

module.exports = { extensions, types };
