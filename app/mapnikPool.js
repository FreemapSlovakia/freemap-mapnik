const { promisify } = require('util');
const { cpus } = require('os');
const process = require('process');

const mapnik = require('mapnik');
const config = require('config');
const genericPool = require('generic-pool');

const { mapnikConfig } = require('./style');

mapnik.register_default_fonts();
mapnik.register_default_input_plugins();

const mp = mapnik.Map.prototype;
mp.fromStringAsync = promisify(mp.fromString);
mp.renderFileAsync = promisify(mp.renderFile);
mp.renderAsync = promisify(mp.render);
mapnik.Image.prototype.encodeAsync = promisify(mapnik.Image.prototype.encode);

const workers = config.get('workers');

const nCpus = cpus().length;

process.env.UV_THREADPOOL_SIZE = (workers.max || nCpus) + 4; // see https://github.com/mapnik/mapnik-support/issues/114

const factory = {
  async create() {
    const map = new mapnik.Map(256, 256);
    await map.fromStringAsync(mapnikConfig);
    return map;
  },
  async destroy() {
    // nothing to do
  },
};

const pool = genericPool.createPool(factory, {
  max: 'max' in workers ? workers.max : nCpus,
  min: 'min' in workers ? workers.min : nCpus,
  priorityRange: 2,
});

module.exports = { pool };
