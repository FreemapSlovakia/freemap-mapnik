# !!!!!!!!!! see https://github.com/mapnik/node-mapnik/issues/908

# FROM golang:1.11 as imposm3
# RUN apt-get update && apt-get install -y \
#     libprotobuf-dev libleveldb-dev libgeos-dev \
#     --no-install-recommends
# WORKDIR $GOPATH
# RUN go get github.com/omniscale/imposm3
# RUN go install github.com/omniscale/imposm3/cmd/imposm

# FROM alpine:edge
FROM alpine:edge
RUN echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
ENV GOPATH /go
RUN apk add --update go git nodejs npm gcompat protobuf protobuf-dev leveldb leveldb-dev geos geos-dev libc-dev \
  && mkdir /go \
  && cd /go \
  && go get github.com/omniscale/imposm3 \
  && go install github.com/omniscale/imposm3/cmd/imposm \
  && apk del go protobuf-dev leveldb-dev geos-dev libc-dev


# VOLUME /app

# FROM mdillon/postgis

# docker pull debian:buster-slim
# docker run -it debian:buster-slim /bin/bash
# docker run -v /home/martin/fm/freemap-mapnik:/freemap-mapnik -it node:10-stretch /bin/bash
