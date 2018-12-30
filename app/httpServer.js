const { tmpdir } = require('os');
const path = require('path');
const http = require('http');
const { stat, unlink } = require('fs').promises;

const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const send = require('koa-send');

const { renderTile, toPdf } = require('./renderrer');
const { generateFreemapStyle } = require('./style');

const app = new Koa();
const router = new Router();

const minZoom = config.get('zoom.min');
const maxZoom = config.get('zoom.max');

const serverPort = config.get('server.port');

const tilesDir = path.resolve(__dirname, '..', config.get('dirs.tiles'));

router.get('/:zoom/:x/:yy', async (ctx) => {
  const { zoom, x, yy } = ctx.params;

  const yyMatch = /(\d+)(?:@(\d+(?:\.\d+)?)x)?/.exec(yy);

  if (!yyMatch) {
    ctx.status = 400;
    return;
  }

  let y = Number.parseInt(yyMatch[1], 10);
  const r = yyMatch[2] ? Number.parseFloat(yyMatch[2], 10) : 1;

  const zoomNum = Number.parseFloat(zoom);
  if (Number.isNaN(zoomNum) || zoomNum < minZoom || zoomNum > maxZoom) {
    ctx.status = 400;
    return;
  }

  const file = await renderTile(Number.parseInt(zoomNum, 10), Number.parseInt(x, 10), Number.parseInt(y, 10), false, r);

  ctx.status = 200;

  if (r === 1) {
    const stats = await stat(file);
    ctx.set('Last-Modified', stats.mtime.toUTCString());

    if (ctx.fresh) {
      ctx.status = 304;
      return;
    }
  }

  await send(ctx, path.relative(tilesDir, file), { root: tilesDir });

  if (r !== 1) {
    await unlink(file);
  }
});

let tmpIndex = Date.now();

// example: http://localhost:4000/pdf?zoom=13&bbox=21.4389,48.6531,21.6231,48.7449&scale=0.75
router.get('/pdf', async (ctx) => {
  const q = ctx.query;
  const zoom = Number.parseInt(q.zoom, 10);
  const bbox = (q.bbox || '').split(',').map((c) => Number.parseFloat(c));
  if (zoom < 0 || zoom > 20 || bbox.length !== 4 || bbox.some((c) => Number.isNaN(c))) {
    ctx.status = 400;
    return;
  }
  const filename = `export-${tmpIndex++}.pdf`;
  const exportFile = path.resolve(tmpdir(), filename);
  const mapnikConfig = generateFreemapStyle(
    b(q.shading),
    b(q.contours),
    b(q.hikingTrails),
    b(q.bicycleTrails),
  );

  const cancelHolder = {};
  const cancelHandler = () => {
    cancelHolder.cancelled = true;
  };

  ctx.req.on('close', cancelHandler);

  try {
    try {
      await toPdf(
        exportFile, mapnikConfig, zoom, bbox,
        Number.parseFloat(q.scale) || undefined,
        Number.parseFloat(q.width) || undefined,
        cancelHolder,
      );
    } finally {
      ctx.req.off('close', cancelHandler);
    }

    ctx.status = 200;
    await send(ctx, filename, { root: tmpdir() });
  } finally {
    await unlink(exportFile);
  }
});

function b(value) {
  return value === undefined ? undefined : !/^(0|false|no)$/.test(value);
}

app
  .use(router.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());

function listenHttp() {
  server.listen(serverPort, () => {
    console.log(`Listening on port ${serverPort}.`);
  });
}

function closeServer() {
  server.close();
}

module.exports = { listenHttp, closeServer };
