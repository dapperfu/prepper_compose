FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends bash ca-certificates curl python3 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/library
COPY content/catalog.yml content/catalog.yml
COPY scripts/fetch-content.sh scripts/fetch-content.sh
RUN chmod +x scripts/fetch-content.sh

# The archives are hundreds of gigabytes. The container writes them to the
# /data/zim volume (see docker-compose.yml) so a dropped connection can resume.
ENV ZIM_DIR=/data/zim
ENTRYPOINT ["/opt/library/scripts/fetch-content.sh"]
CMD ["--yes"]
