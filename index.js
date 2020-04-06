const { startMapserver } = require('freemap-mapserver');
const { mapnikConfig, generateFreemapStyle } = require('./style');
const { initIcons } = require('./style/routes');

function mapFeatureProperties(props) {
  if (!('name' in props)) {
    props.name = '';
  }

  return props;
}

initIcons().then(() => {
  startMapserver(mapnikConfig, generateFreemapStyle, mapFeatureProperties);
});
