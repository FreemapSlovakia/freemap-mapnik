import { startMapserver } from "freemap-mapserver";
import { mapnikConfig, generateFreemapStyle } from "./style";
import { initIcons } from "./style/routes";
import { legend } from "./legend";

initIcons().then(() => {
  startMapserver(mapnikConfig, generateFreemapStyle, legend);
});
