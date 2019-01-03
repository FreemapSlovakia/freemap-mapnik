FROM debian:buster-slim
ENV GOPATH /go
RUN apt-get update \
  && apt-get -y install --no-install-recommends golang git libprotobuf-dev libleveldb-dev libgeos-dev ca-certificates gcc \
  && mkdir /go \
  && cd /go \
  && go get github.com/omniscale/imposm3 \
  && go install github.com/omniscale/imposm3/cmd/imposm \
  && apt-get -y remove --purge golang gcc \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/*
RUN apt-get update \
  && apt-get -y install --no-install-recommends wget xz-utils \
  && wget https://nodejs.org/dist/v10.15.0/node-v10.15.0-linux-x64.tar.xz \
  && tar xf node-v10.15.0-linux-x64.tar.xz \
  && rm node-v10.15.0-linux-x64.tar.xz \
  && apt-get -y remove --purge xz-utils \
  && apt-get -y autoremove \
  && rm -rf /var/lib/apt/lists/*
ENV PATH "${PATH}:/node-v10.15.0-linux-x64/bin"
EXPOSE 4000
