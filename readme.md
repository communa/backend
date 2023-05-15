### Introduction
Communa is a web3 platform for freelancing that connects businesses with talented professionals worldwide, making remote work more convenient than ever before.

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

`NODE_ENV=production pm2 start build/server.js --watch`

### Cron
*/5 * * * * cd /var/www/html/communa-backend && NODE_ENV=production node build/command/ImportPagesCommand.js 50 5
*/5 * * * * cd /var/www/html/communa-backend && NODE_ENV=production node build/command/ImportWebsiteCommand.js

### Commands
NODE_ENV=production node /var/www/html/communa-backend/build/command/ImportPagesCommand.js 25 5
NODE_ENV=production node build/command/ImportWebsiteCommand.js

### DB

```
NODE_ENV=production npm run typeorm:cli -- schema:sync
NODE_ENV=development npm run typeorm:cli -- schema:sync

NODE_ENV=test npm run typeorm:cli -- schema:drop
NODE_ENV=test npm run typeorm:cli -- schema:sync

NODE_ENV=production npm run typeorm:cli -- schema:drop && NODE_ENV=production npm run typeorm:cli -- schema:sync
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
