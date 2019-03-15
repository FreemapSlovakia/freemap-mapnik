const shapefile = require('shapefile');

let next = false;

function split(coords, height) {
  if (coords.length > 1000) {
    split(coords.slice(0, coords.length / 2 + 1), height);
    split(coords.slice(coords.length / 2, coords.length), height);
  } else {
    console.log((next ? ',' : '') + JSON.stringify({
      type: 'Feature',
      properties: { height },
      geometry: {
        type: 'LineString',
        coordinates: coords,
      },
    }));

    if (!next) {
      next = true;
    }
  }
}

async function run() {
  // /media/martin/data/martin/mapping/dmr20/new/contours.shp
  const source = await shapefile.open(process.argv[2]);

  console.log('{"type": "FeatureCollection", "features": [');

  for (;;) {
    const result = await source.read();
    if (result.done) {
      break;
    }

    split(result.value.geometry.coordinates, result.value.properties.height);
  }

  console.log(']}');
}

run();
