# Mapnik based Freemap Outdoor Map

## Features

- Mapnik configuration in TypeScript (JSX) adding all benefits of typed scripting (preventing repetition, programatic style generation, type validation, code assist, …)
- Map tile serving (TMS)
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
