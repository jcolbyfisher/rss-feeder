'use strict';

const { getSite } = require('../../daos/sites');
const { getLatestEntriesForSite } = require('../../daos/entries');

module.exports = async function (fastify, opts) {
  fastify.get('/:meal', async function ({ params }, reply) {
    const site = await getSite(fastify.sqlite, params.meal);

    if (!site) {
      reply.status = 404;
      return;
    }

    const entries = await getLatestEntriesForSite(fastify.sqlite, site.id);

    return { ...site, entries };
  });
};
