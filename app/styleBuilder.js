const builder = require('xmlbuilder');

function sanitizeAtts(obj) {
  const res = {};
  Object.keys(obj).filter(key => obj[key] !== undefined).forEach((key) => {
    res[key.replace(/[A-Z]/g, (x) => '-' + x.toLowerCase())] = obj[key];
  });
  return res;
}

const zoomDenoms = [
  1000000000,
  500000000,
  200000000,
  100000000,
  50000000,
  25000000,
  12500000,
  6500000,
  3000000,
  1500000,
  750000, // 10
  400000,
  200000,
  100000,
  50000,
  25000,
  12500,
  5000,
  2500,
  1500,
  750, // 20
  500,
  250,
  100,
  50,
  25,
  12.5,
];

function createMap(atts, { dbParams } = {}) {
  const mapEle = builder.begin().ele('Map', sanitizeAtts(atts));

  if (dbParams) {
    const dsEle = mapEle.ele('Datasource', { name: 'db' });
    Object.keys(dbParams).forEach((name) => {
      dsEle.ele('Parameter', { name }, dbParams[name]);
    });
  }

  const map = {
    doInMap(cb) {
      cb(map);
      return map;
    },
    addStyle(name, atts = {}) {
      const styleEle = mapEle.ele('Style', { name, ...sanitizeAtts(atts) });
      const style = {
        doInStyle(cb) {
          cb(style);
          return style;
        },
        addRule({ filter, maxZoom, minZoom } = {}) {
          const ruleEle = styleEle.ele('Rule');
          if (filter) {
            ruleEle.ele('Filter', {}, filter);
          }
          if (typeof maxZoom === 'number') {
            if (zoomDenoms[maxZoom + 2]) {
              ruleEle.ele('MinScaleDenominator', {}, zoomDenoms[maxZoom + 1]);
            }
          }
          if (typeof minZoom === 'number') {
            if (zoomDenoms[minZoom]) {
              ruleEle.ele('MaxScaleDenominator', {}, zoomDenoms[minZoom]);
            }
          }
          const ascendents = { style, map };
          const rule = {
            doInRule(cb) {
              cb(map);
              return map;
            },
            addFilter(filter) {
              const filterEle = ruleEle.ele('Filter', {}, filter);
              return { filterEle, ...rule, ...ascendents };
            },
            addPolygonSymbolizer(atts = {}) {
              const polygonSymbolizerEle = ruleEle.ele('PolygonSymbolizer', sanitizeAtts(atts));
              return { polygonSymbolizerEle, ...rule, ...ascendents };
            },
            addPolygonPatternSymbolizer(atts = {}) {
              const polygonPatternSymbolizerEle = ruleEle.ele('PolygonPatternSymbolizer', sanitizeAtts(atts));
              return { polygonPatternSymbolizerEle, ...rule, ...ascendents };
            },
            addLineSymbolizer(atts = {}) {
              const lineSymbolizerEle = ruleEle.ele('LineSymbolizer', sanitizeAtts(atts));
              return { lineSymbolizerEle, ...rule, ...ascendents };
            },
            addLinePatternSymbolizer(atts = {}) {
              const linePatternSymbolizerEle = ruleEle.ele('LinePatternSymbolizer', sanitizeAtts(atts));
              return { linePatternSymbolizerEle, ...rule, ...ascendents };
            },
            addMarkersSymbolizer(atts = {}) {
              const markersSymbolizerEle = ruleEle.ele('MarkersSymbolizer', sanitizeAtts(atts));
              return { markersSymbolizerEle, ...rule, ...ascendents };
            },
            addTextSymbolizer(atts = {}, text) {
              const textSymbolizerEle = ruleEle.ele('TextSymbolizer', sanitizeAtts(atts), text);
              return { textSymbolizerEle, ...rule, ...ascendents };
            },
            addRasterSymbolizer(atts = {}) {
              const rasterSymbolizerEle = ruleEle.ele('RasterSymbolizer', sanitizeAtts(atts));
              return { rasterSymbolizerEle, ...rule, ...ascendents };
            },
            addShieldSymbolizer(atts = {}) {
              const shieldSymbolizerEle = ruleEle.ele('ShieldSymbolizer', sanitizeAtts(atts));
              return { shieldSymbolizerEle, ...rule, ...ascendents };
            },

            addBorderedPolygonSymbolizer(color) {
              const polygonSymbolizerEle = ruleEle.ele('PolygonSymbolizer', sanitizeAtts({ fill: color }));
              const lineSymbolizerEle = ruleEle.ele('LineSymbolizer', sanitizeAtts({ stroke: color, strokeWidth: 1 }));
              return { polygonSymbolizerEle, lineSymbolizerEle, ...rule, ...ascendents };
            },
            ruleEle,
            ...style,
          };
          return rule;
        },
        styleEle,
        ...map,
      };
      return style;
    },
    addSqlLayer(styleName, sql, atts = {}) {
      const layerEle = mapEle.ele('Layer', sanitizeAtts(atts));
      for (const sn of Array.isArray(styleName) ? styleName : [styleName]) {
        layerEle.ele('StyleName', {}, sn);
      }
      layerEle.ele('Datasource', { base: 'db' })
        .ele('Parameter', { name: 'table' }, `(${sql}) as foo`);
      return this;
    },
    addLayer(styleName, dsParams, atts = {}) {
      const layerEle = mapEle.ele('Layer', sanitizeAtts(atts));
      for (const sn of Array.isArray(styleName) ? styleName : [styleName]) {
        layerEle.ele('StyleName', {}, sn);
      }
      const dsEle = layerEle.ele('Datasource');
      Object.keys(dsParams).forEach((name) => {
        dsEle.ele('Parameter', { name }, dsParams[name]);
      });
      return this;
    },
    mapEle,
    stringify(formattingOptions = { pretty: true }) {
      return mapEle.end(formattingOptions);
    },
  };

  return map;
}

module.exports = {
  sanitizeAtts,
  createMap,
  zoomDenoms,
};
