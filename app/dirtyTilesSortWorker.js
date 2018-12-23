const { parentPort, workerData } = require('worker_threads');

parentPort.on('message', (value) => {
  console.log('FFFFFFFFFFF');

  const tiles = value.sort((a, b) => {
    const c = workerData.zoomPrio.indexOf(a.zoom);
    const d = workerData.zoomPrio.indexOf(b.zoom);
    return c === d ? a.ts - b.ts : c - d;
  });

  console.log('GGGGGGGGGG');
  parentPort.postMessage(tiles);
});
