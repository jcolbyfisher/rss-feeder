'use strict';

const toAtom = require('../../utils/toAtom');

module.exports = async function (fastify, opts) {
  fastify.get('/migrate', async function () {
    fastify.sqlite.exec(`DROP TABLE IF EXISTS migrations`);
    fastify.sqlite.exec(`DROP TABLE IF EXISTS entries`);
    fastify.sqlite.exec(`DROP TABLE IF EXISTS sites`);

    return true;
  });

  function getSite(name) {
    return new Promise(function (resolve, reject) {
      fastify.sqlite.get(
        `SELECT * FROM sites where name=$name`,
        {
          $name: name,
        },
        function (err, data) {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }
      );
    });
  }

  function getLatestEntriesForSite(siteId) {
    return new Promise(function (resolve, reject) {
      fastify.sqlite.all(
        `
          SELECT * 
          FROM entries
          WHERE siteId=$siteId
          LIMIT 15
        `,
        {
          $siteId: siteId,
        },
        function (err, data) {
          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }
      );
    });
  }

  fastify.get('/feed', async function ({ query }, reply) {
    const site = await getSite(query.site);

    if (!site) {
      reply.status = 404;
      return;
    }

    const entries = await getLatestEntriesForSite(site.id);

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
