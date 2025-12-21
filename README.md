# Mapnik based Freemap Outdoor Map

**NOTE: This project is no more used to render outdoor map at https://www.freemap.sk/?layers=X and rendering has been rewritten to [RustMap](https://github.com/FreemapSlovakia/rustmap).**

## Features

- Mapnik configuration in TypeScript (JSX, using [JsxNik](https://github.com/FreemapSlovakia/jsxnik)) adding all benefits of typed scripting (preventing repetition, programatic style generation, type validation, code assist, …)
- Map tile serving using [Freemap Mapserver](https://github.com/FreemapSlovakia/freemap-mapserver)
  - Rendering (export) to PDF/SVG/JPG/PNG
  - Support of tiles for HiDPI / Retina devices
  - Configurable map pre-rendering
  - On-demand tile rendering (if requested tile is not rendered yet)
  - Detection of dirty tiles (based on changes reported by imposm3) and rendering scheduling
  - Easy style development and debugging (save and reload)
  - Many features are configurable

## Demo

https://www.freemap.sk/?layers=X

## Installation

### Using Docker

**probably outdated**

Use this method for easier installation for development purposes.

Please see [doc/DOCKER.md](./doc/DOCKER.md).

### Regular

Please see [doc/INSTALL.md](./doc/INSTALL.md).

## Additional configuration

```json5
{
  mapFeatures: {
    contours: true,
    shading: true,
    hikingTrails: true,
    bicycleTrails: true,
    skiTrails: true,
  },

  // ...other configuration required by freemap-mapserver
}
```
