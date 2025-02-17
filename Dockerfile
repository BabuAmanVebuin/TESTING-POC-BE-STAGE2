FROM node:20.18.0-alpine as base 

WORKDIR /usr/src/app

# Install Dependencies
COPY yarn.lock package.json ./
RUN rm -rf node_modules && yarn install --frozen-lockfile

FROM node:20.18.0-alpine as builder 
WORKDIR /usr/src/app
COPY --from=base /usr/src/app/ /usr/src/app/

# Copy Project files
COPY . .

RUN yarn build 

EXPOSE 8000

WORKDIR build
ENTRYPOINT [ "node", "index.js" ]
