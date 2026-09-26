import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { layers, namedFlavor } from "@protomaps/basemaps";

const out = "/build/out";
mkdirSync(`${out}/vendor`, { recursive: true });
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl.js",
  `${out}/vendor/maplibre-gl.js`,
);
copyFileSync(
  "node_modules/maplibre-gl/dist/maplibre-gl.css",
  `${out}/vendor/maplibre-gl.css`,
);

const style = {
  version: 8,
  glyphs: "/map-assets/fonts/{fontstack}/{range}.pbf",
  sprite: "/map-assets/sprites/v4/light",
  sources: {
    protomaps: {
      type: "vector",
      tiles: ["/tiles/world/{z}/{x}/{y}.mvt"],
      minzoom: 0,
      maxzoom: 6,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://protomaps.com">Protomaps</a>',
    },
  },
  layers: layers("protomaps", namedFlavor("light"), { lang: "en" }),
};

writeFileSync(`${out}/style.json`, JSON.stringify(style));
