const fallbackRegions = [
  { id: "world", label: "World overview", maxzoom: 6, center: [-30, 20], zoom: 1 },
  { id: "north-america", label: "North America", maxzoom: 14, center: [-98, 39], zoom: 3 },
  { id: "europe", label: "Europe", maxzoom: 14, center: [10, 50], zoom: 3 },
  { id: "oceania", label: "Oceania", maxzoom: 14, center: [146, -28], zoom: 3 },
];

const regionRow = document.querySelector("#regions");
const status = document.querySelector("#map-status");

async function loadRegions() {
  try {
    const response = await fetch("/files/map-config.json");
    if (!response.ok) return fallbackRegions;
    const payload = await response.json();
    return payload.regions?.length ? payload.regions : fallbackRegions;
  } catch {
    return fallbackRegions;
  }
}

function applyRegion(style, region) {
  const next = structuredClone(style);
  const origin = location.origin;
  if (next.glyphs && next.glyphs.startsWith("/")) next.glyphs = origin + next.glyphs;
  if (next.sprite && next.sprite.startsWith("/")) next.sprite = origin + next.sprite;
  next.sources.protomaps.tiles = [`${origin}/tiles/${region.id}/{z}/{x}/{y}.mvt`];
  next.sources.protomaps.minzoom = 0;
  next.sources.protomaps.maxzoom = region.maxzoom;
  return next;
}

async function main() {
  const [styleResponse, regions] = await Promise.all([
    fetch("/style.json"),
    loadRegions(),
  ]);
  if (!styleResponse.ok) {
    status.textContent = "The map style did not load.";
    return;
  }
  const baseStyle = await styleResponse.json();
  let current = regions[0];
  const map = new maplibregl.Map({
    container: "map",
    style: applyRegion(baseStyle, current),
    center: current.center,
    zoom: current.zoom,
    attributionControl: true,
  });
  map.addControl(new maplibregl.NavigationControl(), "top-right");

  function select(region) {
    current = region;
    map.setStyle(applyRegion(baseStyle, region));
    map.once("style.load", () => {
      map.jumpTo({ center: region.center, zoom: region.zoom });
    });
    [...regionRow.children].forEach((button) => {
      button.setAttribute("aria-pressed", button.dataset.id === region.id ? "true" : "false");
    });
  }

  regions.forEach((region) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.id = region.id;
    button.textContent = region.label;
    button.setAttribute("aria-pressed", region.id === current.id ? "true" : "false");
    button.addEventListener("click", () => select(region));
    regionRow.appendChild(button);
  });

  const probe = await fetch(`/tiles/${current.id}/0/0/0.mvt`);
  status.textContent = probe.ok
    ? "Street map from OpenStreetMap. Photos from satellites are not included."
    : "The map page is up. Tile files are not installed yet. Run docker compose build while you still have internet.";
}

main();
