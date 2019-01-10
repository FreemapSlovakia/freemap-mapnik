const { startMapserver } = require('freemap-mapserver');
const { mapnikConfig, generateFreemapStyle } = require('./style');

startMapserver(mapnikConfig, generateFreemapStyle);
