'use strict';

const toAtom = require('../../utils/toAtom');

const { getSite } = require('../../daos/sites');
const { getLatestEntriesForSite } = require('../../daos/entries');

module.exports = async function (fastify, opts) {
  fastify.get('/migrate', async function () {
    fastify.sqlite.exec(`DROP TABLE IF EXISTS migrations`);
    fastify.sqlite.exec(`DROP TABLE IF EXISTS entries`);
    fastify.sqlite.exec(`DROP TABLE IF EXISTS sites`);

    return true;
  });

  fastify.get('/feed', async function ({ query }, reply) {
    const site = await getSite(fastify.sqlite, query.site);

    if (!site) {
      reply.status = 404;
      return;
    }

    const entries = await getLatestEntriesForSite(fastify.sqlite, site.id);

    const res = toAtom(
      site.name,
      site.url,
      site.icon,
      site.lastFetchedAt,
      entries
    );

    return res;
  });
};
