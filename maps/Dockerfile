FROM debian:bookworm-slim AS tiles
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl grep \
  && rm -rf /var/lib/apt/lists/*
COPY --from=protomaps/go-pmtiles:latest /go-pmtiles /usr/local/bin/pmtiles
COPY extract-tiles.sh /usr/local/bin/extract-tiles.sh
ARG MAP_MAXZOOM=14
RUN chmod +x /usr/local/bin/extract-tiles.sh \
  && MAP_MAXZOOM="$MAP_MAXZOOM" /usr/local/bin/extract-tiles.sh

FROM protomaps/go-pmtiles:latest
COPY --from=tiles /maps /maps
