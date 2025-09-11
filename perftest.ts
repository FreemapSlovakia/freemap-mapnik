const max_z = 16;
const min_z = 12;
const min_x = 36200;
const max_x = 36210;
const min_y = 22650;
const max_y = 22660;

const proms: Promise<void>[] = [];

let count = 0;

let start = Date.now();

for (let z = max_z; z >= min_z; z--) {
  const delta = 1 << (max_z - z);

  for (let y = min_y; y <= max_y; y += delta) {
    for (let x = min_x; x <= max_x; x += delta) {
      const url = `http://localhost:4000/${z}/${(x / delta).toFixed()}/${(y / delta).toFixed()}@2x`;

      // console.log(url);

      count++;

      proms.push(
        fetch(url)
          .then((res) => {
            if (!res.ok) {
              throw new Error("Response not OK: " + res.status);
            }
          })
          .finally(() => {
            count--;

            console.log(url, count);
          }),
      );
    }
  }
}

Promise.all(proms).then(() => {
  console.log((Date.now() - start) / 1000);
});

// 170 tiles; Times: 1st run after CPU cooldown, 2nd run, 3rd run
// @mapnik/mapnik@4.7.3 (Mapnik v4.1.2): 22.156, 12.199, 12.091 (if max_async_connection: 4, 2nd 35.565 !)
// @mapnik/mapnik@4.6.5 (Mapnik v4.0.2): 22.776, 12.405, 12.546
// mapnik@4.5.9 (Mapnik v3.0.12-1190-ge553f55dc): 12.253, 6.398, 6.275

//120: 40.026, 24.028, 24.188
// 4: 39.915, 24.172, 24.148
//
