const { startMapserver } = require('freemap-mapserver');
const { mapnikConfig, generateFreemapStyle } = require('./style');
const { initIcons } = require('./style/routes');

initIcons().then(() => {
  startMapserver(mapnikConfig, generateFreemapStyle);
});
