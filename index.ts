import { startMapserver } from "freemap-mapserver";
import { mapnikConfig, generateFreemapStyle } from "./style/index.js";
import { initIcons } from "./style/routes.js";
import { legend } from "./legend.js";

initIcons().then(() => {
  startMapserver(mapnikConfig, generateFreemapStyle, legend);
});
