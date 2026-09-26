# Replace a $295 Raspberry Pi with `docker compose build`

This entire project was "sponsored" by [Prepper Disk](https://www.prepperdisk.com/pages/landing).

Sponsorship means I read a landing page selling a Raspberry Pi and a 512 GB SD card as a pocket Library of Alexandria, got inspired by the markup, and wrote a compose file. The Premium 512 GB unit was listed at $279 the morning this README was written. Call it $295 after you blink at shipping, tax, or the Faraday bag. Bi-weekly payments start around $95.80 down, which is a financing plan for an SD card.

The page is honest about the trick in the small print. It runs on Kiwix. Wikipedia, wikiHow, iFixit, Project Gutenberg, medical wikis, a Morse page, a phrase book, and a round of solitaire for when the TED talk about farming ends. Setup is plug it in, join a Wi-Fi network named PrepperDisk, type `10.10.10.10`, and feel prepared.

I already have several machines in the house that run Docker. I also have an internet connection. For now. That is the whole bill of materials.

```bash
./scripts/fetch-nps.sh
docker compose up -d --build
```

`docker compose build` is the part that replaces the little aluminum brick: it builds the site and bakes the street maps. `up` is the part that fills the disk with the public archives. Nobody in Massachusetts packs the box. You already own the box.

## What you are not buying

A Prepper Disk is a real object with one job their landing page spends a long time selling: it makes its own Wi-Fi, so a phone can reach it when the house router is a paperweight. This stack does not do that. It serves the machines already on your network, at `http://<this-machine>:8888`. If you wanted a hockey puck that boots a hotspot from a power bank, you wanted the hockey puck.

You also do not get their licensed survival books, a copy of RepeaterBook, or satellite photos. Those stay on their card. Put manuals you have a right to keep in `data/files`.

What you do get is the public library, on hardware that was already plugged in, updated by running the same command again while the internet still exists.

## What lands on disk

The full public ZIM set currently resolves to about 402 GB before Khan Academy. English Wikipedia with pictures is about 119 GB, full English Wikibooks about 6 GB, full English wikiHow about 48 GB, full English iFixit about 3 GB, and the full English Project Gutenberg archive about 206 GB. Map tiles are built into the maps image and are often tens of gigabytes more. The 512 GB was never the scam. Paying someone to write a public download onto it was.

Library archives live in `data/` and are not stored inside the images. Once `data/zim/manifest.json` records a finished archive, later starts skip that file with the cable unplugged.

- **Wikipedia, Wikibooks, wikiHow, iFixit, Project Gutenberg.** Each opens its own book under `/library/`.
- **WikiMed, WikEM, field packs.** Water, knots, medicine, food, post-disaster guides, Appropedia, Energypedia.
- **Stack Exchange.** Sustainable living, the outdoors, mechanics, woodworking.
- **TED talks.** Farming, natural disasters, and climate, when those optional archives are still published.
- **Street maps.** A world overview at zoom 6, plus North America, Europe, and Oceania. Streets and places. `MAP_MAXZOOM` defaults to 14 (allowed range 1–15). `MAP_MAXZOOM=12 docker compose build maps` builds less detail.
- **National park brochures.** Public PDFs, where the Park Service page still links one.
- **Khan Academy, via Kolibri.** The container starts empty. Import a channel while you are online.
- **Morse, emergency phrases, solitaire.** They run in the browser. The apocalypse can still include losing at Klondike.
- **A files folder.** Anything you copy into `data/files`, including a USB drive mounted on the host.

## Start

Install Docker and Docker Compose. While this machine still has internet:

```bash
./scripts/fetch-nps.sh
docker compose up -d --build
```

`docker compose up` builds the content image and runs `scripts/fetch-content.sh --yes`. That downloads the archives in `content/catalog.yml` into `data/zim`. The command keeps going until those files are on disk. Kiwix starts after the download finishes. The home page, maps, and Kolibri come up while the download is still running. The first run needs a lot of free disk. Run the same command again to resume an interrupted download.

`docker compose build` downloads and extracts every street-map archive into the maps image, and pulls Qwen2.5 1.5B, Nemotron 3, and GLM 5.3 Flash into the Ollama image. `docker compose build --no-cache maps` replaces tiles already baked into the image. `docker compose build --no-cache ollama` replaces the models already baked into that image.

Open `http://<this-machine>:8888`. Kolibri Studio is `http://<this-machine>:8889`. Maps are `http://<this-machine>:8891`. Ollama is `http://<this-machine>:8892`.

`./scripts/fetch-content.sh` without `--yes` only prints names and sizes. `./scripts/fetch-content.sh --yes` downloads the same archives into `data/zim` without Docker. There is no smaller Wikipedia and no way to skip Gutenberg. The Library of Alexandria did not offer a lite SKU either.

## What each service does

- **Portal** (`Dockerfile`, port 8888) is the home page, Morse decoder, emergency phrase book, solitaire, and street map. It reverse-proxies the library, map tiles, and the files folder.
- **Content** (`content/Dockerfile`) runs `scripts/fetch-content.sh --yes` and writes the archives into `data/zim`.
- **Kiwix** serves every `.zim` file in `data/zim` at `/library/`. Date-free addresses such as `/library/wikipedia_en_all_maxi/` open the book. The file list stays at `/library/`.
- **Maps** serves PMTiles on port 8891, cut from the current Protomaps daily build during `docker compose build`.
- **Kolibri** stores learning content in `data/kolibri` and is published on port 8889.
- **Ollama** (`ollama/Dockerfile`, port 8892) serves `qwen2.5:1.5b`, `nemotron3:33b`, and `glm-5.3-flash:cloud` from inside the image. GLM 5.3 Flash is published only as an Ollama cloud model, so that pull stores the cloud tag. There is no model volume.

## Khan Academy

Find the channel id on Kolibri Studio while you are online, then:

```bash
./scripts/import-kolibri.sh CHANNEL_ID
```

Kolibri’s lesson player also uses port 8890. Leave that port reachable on the LAN.

## Files and USB

Copy manuals and other files you have a right to store into `data/files`. They show up at `/files/`. The web server reads them as a non-root user, so the files need to be world-readable.

To share a USB drive, mount it on the host and add a volume under `portal` in `docker-compose.yml`:

```yaml
- /media/usb:/data/files/usb:ro
```

National park brochure PDFs are saved in `data/files/nps/` by `scripts/fetch-nps.sh`. Parks without a working link are skipped and listed.

## Left on their SD card

- Commercial survival guides. Add your own legal copy under Files.
- RepeaterBook. Install the official app and refresh its database on the phone before you need it offline.
- Satellite imagery. Use the street map.
- A private Wi-Fi network, an aluminum case, and a one-year warranty on a Pi you can buy yourself.

## After the downloads

`docker compose up -d` is enough on later boots. New ZIM files are picked up with `docker compose restart kiwix`. Newer map tiles are picked up with `docker compose build --no-cache maps` and then `docker compose up -d maps`.

If Kiwix keeps restarting, `data/zim` does not contain a `.zim` file yet. The library service expects at least one archive. The grid can wait.
