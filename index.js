const { startMapserver } = require('freemap-mapserver');
const { mapnikConfig, generateFreemapStyle } = require('./style');
const { initIcons } = require('./style/routes');

function mapFeatureProperties(props) {
  return props; // TODO
}

initIcons().then(() => {
  startMapserver(mapnikConfig, generateFreemapStyle, mapFeatureProperties);
});
