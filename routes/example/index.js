'use strict';

const feed = require('../../meals/allSides');
const toAtom = require('../../utils/toAtom');

module.exports = async function (fastify, opts) {
  fastify.get('/migrate', async function () {
    fastify.sqlite.exec(`DROP TABLE IF EXISTS entries`);
    fastify.sqlite.exec(`DROP TABLE IF EXISTS sites`);

    fastify.sqlite.exec(`CREATE TABLE IF NOT EXISTS sites (
      id INTEGER NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      icon TEXT NOT NULL,
      lastFetchedAt INTEGER NOT NULL
    )`);

    fastify.sqlite.exec(`
      CREATE UNIQUE INDEX idx_sites_name
      ON sites (name)
    `);

    fastify.sqlite.exec(`CREATE TABLE IF NOT EXISTS entries (
      id INTEGER NOT NULL PRIMARY KEY,
      siteId INTEGER NOT NULL,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      fetchedAt INTEGER NOT NULL,

      FOREIGN KEY (siteId) REFERENCES sites (id),
      UNIQUE (siteId, url) ON CONFLICT REPLACE
    )`);
    // PRIMARY KEY (id, siteId, url),

    fastify.sqlite.exec(`
      CREATE INDEX idx_entries_siteId
      ON entries (siteId)
    `);

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
          console.log('getSite', { err, data });

          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }
      );
    });
  }

  function createSite(name, url, icon) {
    return new Promise(function (resolve, reject) {
      fastify.sqlite.run(
        `
          INSERT INTO sites (name, url, icon, lastFetchedAt) 
          VALUES ($name, $url, $icon, $lastFetchedAt)`,
        {
          $name: name,
          $url: url,
          $icon: icon,
          $lastFetchedAt: new Date().getTime(),
        },
        function (err) {
          console.log('createSite', { err, data: this });

          if (err) {
            return reject(err);
          } else {
            return resolve(this);
          }
        }
      );
    });
  }

  function updateSite(name, url, icon) {
    console.log('in update', { name, url, icon });
    return new Promise(function (resolve, reject) {
      fastify.sqlite.run(
        `
          UPDATE sites 
          SET url = $url, icon = $icon, lastFetchedAt = $lastFetchedAt 
          WHERE name = $name
        `,
        {
          $name: name,
          $url: url,
          $icon: icon,
          $lastFetchedAt: new Date().getTime(),
        },
        function (err) {
          console.log('updateSite', { err, data: this });

          if (err) {
            return reject(err);
          } else {
            return resolve(this);
          }
        }
      );
    });
  }

  function getEntry(siteId, url) {
    console.log('in getEntry', { siteId, url });
    return new Promise(function (resolve, reject) {
      fastify.sqlite.get(
        `
          SELECT * 
          FROM entries
          WHERE siteId=$siteId AND url=$url
        `,
        {
          $siteId: siteId,
          $url: url,
        },
        function (err, data) {
          console.log('getEntry', { err, data });

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
    console.log('in getLatestEntriesForSite', { siteId });
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
          console.log('getLatestEntriesForSite', { err, data });

          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }
      );
    });
  }

  function createEntry(siteId, title, url, content, lastFetchedAt) {
    console.log('createEntry start', {
      siteId,
      title,
      url,
      content,
      lastFetchedAt,
    });

    return new Promise(function (resolve, reject) {
      fastify.sqlite.run(
        `
        INSERT INTO entries (siteId, title, url, content, timestamp, fetchedAt) 
        VALUES ($siteId, $title, $url, $content, $timestamp, $fetchedAt)
        `,
        {
          $siteId: siteId,
          $title: title,
          $url: url,
          $content: content,
          $timestamp: lastFetchedAt,
          $fetchedAt: lastFetchedAt,
        },
        function (err) {
          console.log('createEntry', { err, data: this });

          if (err) {
            return reject(err);
          } else {
            return resolve(this);
          }
        }
      );
    });
  }

  function upsertEntry(siteId, name, url, content, lastFetchedAt) {
    console.log('upsertEntry start', {
      siteId,
      name,
      url,
      content,
      lastFetchedAt,
    });
    return new Promise(function (resolve, reject) {
      fastify.sqlite.run(
        `
          INSERT INTO entries (siteId, title, url, content, timestamp, fetchedAt) 
          VALUES ($siteId, $title, $url, $content, $timestamp, $fetchedAt)
          ON DUPLICATE KEY UPDATE
          DO UPDATE SET title=excluded.title, content=excluded.content, fetchedAt=excluded.fetchedAt
            INSERT OR IGNORE INTO entries VALUES ($ip, 0);
            UPDATE visits SET hits = hits + 1 WHERE ip LIKE $ip;
        `,
        {
          $siteId: siteId,
          $url: url,
          $title: name,
          $content: content,
          $timestamp: new Date().getTime(),
          $fetchedAt: lastFetchedAt,
        },
        function (err, data) {
          console.log('upsertEntry done', { err, data });

          if (err) {
            return reject(err);
          } else {
            return resolve(data);
          }
        }
      );
    });
  }

  fastify.get('/refresh', async function () {
    try {
      const siteFeed = await feed();
      // const siteFeed = {
      //   name: 'AllSides',
      //   url: 'https://www.allsides.com',
      //   icon: 'https://www.allsides.com/sites/default/files/AllSides-Icon.png',
      //   entries: [
      //     {
      //       title: 'test1',
      //       link: 'news.ycombinator.com',
      //       content: 'test 123 hello',
      //       timestamp: new Date().getTime(),
      //     },
      //     {
      //       title: 'test2',
      //       link: 'news.ycombinator.com',
      //       content: 'test 234 hello',
      //       timestamp: new Date().getTime(),
      //     },
      //     {
      //       title: 'test3',
      //       link: 'news.happy.com',
      //       content: 'test hello',
      //       timestamp: new Date().getTime(),
      //     },
      //   ],
      // };

      let siteCache = await getSite(siteFeed.name);
      console.log('++++', { siteCache });

      if (!siteCache) {
        siteCache = await createSite(
          siteFeed.name,
          siteFeed.url,
          siteFeed.icon
        );

        siteCache = await getSite(siteFeed.name);
      }

      const res = await Promise.all(
        siteFeed.entries.map(async (entry) => {
          const existingEntry = await getEntry(siteCache.id, entry.link);
          console.log({ existingEntry });

          if (!existingEntry) {
            await createEntry(
              siteCache.id,
              entry.title,
              entry.link,
              entry.content,
              entry.timestamp
            );

            return await getEntry(siteCache.id, entry.link);
          } else {
            return await existingEntry;
          }
        })
      );

      console.log(' we done yet ? ', { res });

      return { siteCache, res };
    } catch (ex) {
      return ex;
    }
  });

  fastify.get('/feed', async function ({ query }, reply) {
    // return getSite(query.site);
    console.log({ query });
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
