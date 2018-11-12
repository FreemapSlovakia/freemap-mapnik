const config = require('config');
const path = require('path');
const { readdir, readFile, unlink, remove, open, close, exists } = require('fs-extra');
const computeZoomedTiles = require('./zoomedTileComputer');

const expiresDir = path.resolve(__dirname, '..', config.get('dirs.expires'));
const minZoom = config.get('zoom.min');
const maxZoom = config.get('zoom.max');
const prerender = !!config.get('prerender');

module.exports = async (tilesDir) => {
  const dirs = await readdir(expiresDir);
  const fullFiles = [].concat(...await Promise.all(
    dirs
      .map((dirs) => path.join(expiresDir, dirs))
      .map(async (fd) => readdir(fd).then((x) => x.map((xx) => path.join(fd, xx)))),
  ));

  const contents = await Promise.all(fullFiles.map((ff) => readFile(ff, 'utf8')));
  const tiles = [].concat(...contents
    .join('\n')
    .split('\n')
    .filter((x) => x.trim())
    .map(tile => computeZoomedTiles(tile, minZoom, maxZoom)));

  const tileSet = new Set(tiles);
  console.log('Removing dirty tiles:', tileSet);

  if (prerender) {
    await Promise.all([...tileSet].map(async (tile) => {
      const name = path.resolve(tilesDir, `${tile}.dirty`);
      if (await exists(name)) {
        await close(await open(name, 'w'));
      }
    }));
  } else {
    await Promise.all([...tileSet].map((tile) => remove(path.resolve(tilesDir, `${tile}.png`))));
  }
  await Promise.all(fullFiles.map((ff) => unlink(ff)));
};
