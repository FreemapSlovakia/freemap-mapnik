const builder = require('xmlbuilder');

const mercSrs = '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over';

function cc2snake(obj) {
  const res = {};
  Object.keys(obj).forEach((key) => {
    res[key.replace(/[A-Z]/, (x) => '-' + x.toLowerCase())] = obj[key];
  });
  return res;
}

function createMap(atts) {
  const mapEle = builder.begin().ele('Map', cc2snake(atts));

  const map = {
    addStyle(name, atts = {}) {
      const styleEle = mapEle.ele('Style', { name, ...cc2snake(atts) });
      const style = {
        addRule() {
          const ruleEle = styleEle.ele('Rule');
          const ascendents = { style, map };
          const rule = {
            addFilter(filter) {
              const filterEle = ruleEle.ele('Filter', {}, filter);
              return { filterEle, rule, ...ascendents };
            },
            addPolygonSymbolizer(atts = {}) {
              const polygonSymbolizerEle = ruleEle.ele('PolygonSymbolizer', cc2snake(atts));
              return { polygonSymbolizerEle, rule, ...ascendents };
            },
            addLineSymbolizer(atts = {}) {
              const lineSymbolizerEle = ruleEle.ele('LineSymbolizer', cc2snake(atts));
              return { lineSymbolizerEle, rule, ...ascendents };
            },
            addMarkerSymboliser(atts = {}) {
              const markerSymbolizerEle = ruleEle.ele('MarkerSymbolizer', cc2snake(atts));
              return { markerSymbolizerEle, rule, ...ascendents };
            },
            addTextSymbolizer(atts = {}, text) {
              const textSymbolizerEle = ruleEle.ele('TextSymbolizer', cc2snake(atts));
              return { textSymbolizerEle, rule, ...ascendents };
            },
            ruleEle,
            style,
            map,
          };
          return rule;
        },
        styleEle,
        map,
      };
      return style;
    },
    mapEle,
    stringify(formattingOptions = { pretty: true }) {
      return mapEle.end(formattingOptions)
    },
  };

  return map;
}

module.exports = {
  cc2snake,
  createMap,
};
