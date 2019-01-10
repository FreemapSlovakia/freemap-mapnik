FROM alpine:edge
RUN apk add --update nodejs npm gcompat
RUN mkdir /test
WORKDIR /test
RUN npm init -y
RUN npm i --save mapnik
RUN echo "require('mapnik').register_default_input_plugins();" > index.js
