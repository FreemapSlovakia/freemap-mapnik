const config = require('config');
const { cpus } = require('os');
const { dirtyTiles } = require('./dirtyTilesRegister');
const { renderTile } = require('./renderrer');
const { Worker } = require('worker_threads');

module.exports = {
  prerender,
  resume,
};

const prerenderConfig = config.get('prerender');

const sortWorker = prerenderConfig && new Worker(__dirname + '/dirtyTilesSortWorker.js', {
  workerData: {
    zoomPrio: prerenderConfig.zoomPrio,
  },
});

const resumes = new Set();

function resume() {
  console.log('Resuming pre-rendering. Dirty tiles:', dirtyTiles.size);

  for (const rf of resumes) {
    rf();
  }
  resumes.clear();
}

async function prerender() {
  console.log('Starting pre-renderrer.');

  const tiles = findTilesToRender();

  await Promise.all(Array(prerenderConfig.workers || cpus().length).fill(0)
    .map(() => worker(tiles)));

  throw new Error('unexpected');
}

async function* findTilesToRender() {
  let restart = false;
  function setRestartFlag() {
    restart = true;
  }

  main: for (;;) {
    resumes.add(setRestartFlag);

    console.log('(Re)starting pre-rendering worker.');

    const tiles = await new Promise((resolve) => {
      sortWorker.once('message', (value) => {
        resolve(value);
      });
      sortWorker.postMessage([...dirtyTiles.values()]);
    });

    for (const t of tiles) {
      if (restart) {
        restart = false;
        continue main;
      }
      yield t;
    }

    resumes.delete(setRestartFlag);

    console.log('Putting pre-rendering worker to sleep.');

    await new Promise((resolve) => {
      resumes.add(resolve);
    });
  }
}

async function worker(tiles) {
  for await (const { x, y, zoom } of tiles) {
    await renderTile(zoom, x, y, true);
  }
}
