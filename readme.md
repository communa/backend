### Installation

With Postgres do:
`create database communa_test;`
`create database communa_dev;`

Install node packages:
`yarn install`

Create the necessary database schema
`NODE_ENV=test yarn run typeorm:cli -- schema:sync`

Ensure there are no errors by execution of all tests
`yarn test`

### DB

```
NODE_ENV=production npm run typeorm:cli -- schema:sync
NODE_ENV=development npm run typeorm:cli -- schema:sync

NODE_ENV=test npm run typeorm:cli -- schema:drop
NODE_ENV=test npm run typeorm:cli -- schema:sync

NODE_ENV=development npm run typeorm:cli -- schema:drop && NODE_ENV=development npm run typeorm:cli -- schema:sync
NODE_ENV=test npm run typeorm:cli -- schema:drop && NODE_ENV=test npm run typeorm:cli -- schema:sync
```

### Tests

```
npm yarn test

NODE_ENV=test node --inspect ./node_modules/.bin/mocha --require ts-node/register ./src/test/service/ActivityBuilder.test.ts -g build_transak
```

### OpenAPI

```
http://0.0.0.0:4000/api/help/openApi
```
