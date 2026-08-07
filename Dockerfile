ARG BASE_IMAGE=library/node:22-alpine
FROM ${BASE_IMAGE}

WORKDIR /usr/src/app

COPY .npmrc package.json /usr/src/app

RUN rm -rf node_modules
RUN npm cache clean --force 
RUN npm install --omit=dev 
RUN mv node_modules ../ 
RUN rm -fr /tmp/*
RUN npm cache clean --force

COPY src ./src

CMD ["node", "src/index.mjs"]