# rss-feeder

Convert a site into an RSS feed. Yummy!

TODO:

- [x] scrape a site
- [x] generate basic atom feed direct from site
- [x] sqlite db with schema migration
- [x] store scraped site data in db
- [x] generate atom feed from db data
- [ ] make db work in deployable environment
- [x] get schema migrations to run from anything _but_ an API request
- [ ] use worker/job to scrape site on scheduled basis
- [ ] create nice endpoints/API's for fetching feeds
- [ ] general code quality clean up

# Getting Started with [Fastify-CLI](https://www.npmjs.com/package/fastify-cli)

This project was bootstrapped with Fastify-CLI.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
