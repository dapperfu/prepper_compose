FROM ollama/ollama:latest

COPY pull-models.sh /usr/local/bin/pull-models.sh
RUN chmod +x /usr/local/bin/pull-models.sh \
  && /usr/local/bin/pull-models.sh
