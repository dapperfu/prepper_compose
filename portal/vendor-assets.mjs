import { createWriteStream, mkdirSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const out = "/build/out/map-assets";
const families = ["Noto Sans Regular", "Noto Sans Medium", "Noto Sans Italic"];
const zipUrl =
  "https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip";
const fontBase = "https://protomaps.github.io/basemaps-assets/fonts";

mkdirSync(out, { recursive: true });

const zipResponse = await fetch(zipUrl);
if (!zipResponse.ok) {
  throw new Error(`Asset zip download failed: ${zipResponse.status}`);
}
const zipPath = "/tmp/basemaps-assets.zip";
await pipeline(zipResponse.body, createWriteStream(zipPath));
execFileSync("unzip", ["-q", zipPath, "basemaps-assets-main/sprites/v4/*", "-d", "/tmp/assets"]);
execFileSync("mkdir", ["-p", `${out}/sprites/v4`]);
execFileSync("sh", [
  "-c",
  `cp /tmp/assets/basemaps-assets-main/sprites/v4/* ${out}/sprites/v4/`,
]);

const listing = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" });
const jobs = [];
for (const line of listing.split("\n")) {
  const marker = "basemaps-assets-main/fonts/";
  const index = line.indexOf(marker);
  if (index === -1 || !line.endsWith(".pbf")) continue;
  const relative = line.slice(index + marker.length);
  const family = relative.slice(0, relative.lastIndexOf("/"));
  if (!families.includes(family) || family.includes(" v")) continue;
  jobs.push(relative);
}

async function downloadOne(relative) {
  const url = `${fontBase}/${relative.split("/").map(encodeURIComponent).join("/")}`;
  const destination = path.join(out, "fonts", relative);
  mkdirSync(path.dirname(destination), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Font download failed (${response.status}): ${url}`);
  }
  await pipeline(response.body, createWriteStream(destination));
}

const workers = 12;
let cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const relative = jobs[cursor];
    cursor += 1;
    await downloadOne(relative);
  }
}
await Promise.all(Array.from({ length: workers }, () => worker()));
console.log(`Vendored ${jobs.length} font files and the light sprite.`);
