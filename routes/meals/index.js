'use strict';

const { getSite } = require('../../daos/sites');
const { getLatestEntriesForSite } = require('../../daos/entries');

const atom = require('../../views/atom');
const mealSummary = require('../../views/mealSummary');

module.exports = async function (fastify, opts) {
  fastify.get('/:meal', async function ({ params }, reply) {
    reply.type('text/html');

    const site = await getSite(fastify.sqlite, params.meal);

    if (!site) {
      reply.status = 404;
      return;
    }

    const entries = await getLatestEntriesForSite(fastify.sqlite, site.id);

    const date = new Date(site.lastFetchedAt);

    return mealSummary(site.name, date, entries);
  });

  fastify.get('/:meal/atom', async function ({ hostname, params }, reply) {
    reply.header('Content-Type', 'text/xml');

    const site = await getSite(fastify.sqlite, params.meal);

    if (!site) {
      reply.status = 404;
      return;
    }

    const entries = await getLatestEntriesForSite(fastify.sqlite, site.id);

    const date = new Date(site.lastFetchedAt);

    const feedId = `${hostname}/${params.meal}/atom`;

    return atom(feedId, site.name, site.url, site.icon, date, entries);
  });
};
