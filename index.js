const { startMapserver } = require('freemap-mapserver');
const { mapnikConfig, generateFreemapStyle } = require('./style');
const { initIcons } = require('./style/routes');
const { legend } = require('./legend');

initIcons().then(() => {
  startMapserver(mapnikConfig, generateFreemapStyle, legend);
});
