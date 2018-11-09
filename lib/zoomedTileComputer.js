module.exports = (tile, minZoom, maxZoom) => {
  const [zoom, x, y] = tile.split('/');
  const tiles = [];
  collectZoomedOutTiles(minZoom, tiles, zoom, x, y);
  collectZoomedInTiles(maxZoom, tiles, zoom, x, y);
  return tiles;
}

function collectZoomedOutTiles(minZoom, tiles, zoom, x, y) {
  tiles.push(`${zoom}/${x}/${y}`);
  const z = Number.parseInt(zoom, 10);
  if (z > minZoom) {
    collectZoomedOutTiles(minZoom, tiles, z - 1, Math.floor(x / 2), Math.floor(y / 2));
  }
}

function collectZoomedInTiles(maxZoom, tiles, zoom, x, y) {
  tiles.push(`${zoom}/${x}/${y}`);
  const z = Number.parseInt(zoom, 10);
  if (z < maxZoom) {
    for (const [dx, dy] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
      collectZoomedInTiles(maxZoom, tiles, z + 1, x * 2 + dx, y * 2 + dy);
    }
  }
}
