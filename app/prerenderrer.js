const config = require('config');
const { cpus } = require('os');
const { dirtyTiles } = require('./dirtyTilesRegister');
const { renderTile } = require('./renderrer');

module.exports = {
  prerender,
  resume,
};

const prerenderConfig = config.get('prerender');

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
  const { zoomPrio } = prerenderConfig;
  let restart = false;
  function setRestartFlag() {
    restart = true;
  }

  main: for (;;) {
    resumes.add(setRestartFlag);

    console.log('(Re)starting pre-rendering worker.');

    const tiles = [...dirtyTiles.values()].sort((a, b) => {
      const c = zoomPrio.indexOf(a.zoom);
      const d = zoomPrio.indexOf(b.zoom);
      return c === d ? a.ts - b.ts : c - d;
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
