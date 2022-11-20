const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const feed = require('../meals/allSides');

function getSite(db, name) {
  return new Promise(function (resolve, reject) {
    db.get(
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

function createSite(db, name, url, icon) {
  return new Promise(function (resolve, reject) {
    db.run(
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
        if (err) {
          return reject(err);
        } else {
          return resolve(this);
        }
      }
    );
  });
}

function getEntry(db, siteId, url) {
  return new Promise(function (resolve, reject) {
    db.get(
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
        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      }
    );
  });
}

function createEntry(db, siteId, title, url, content, lastFetchedAt) {
  return new Promise(function (resolve, reject) {
    db.run(
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
        if (err) {
          return reject(err);
        } else {
          return resolve(this);
        }
      }
    );
  });
}

const task = new AsyncTask(
  'buildMenu',
  () => {
    console.log('starting job');

    return new Promise(async (resolve, reject) => {
      try {
        const db = new sqlite3.Database(
          path.join(__dirname, '../db/rss_feeder.sqlite')
        );

        const siteFeed = await feed();

        let siteCache = await getSite(db, siteFeed.name);

        if (!siteCache) {
          siteCache = await createSite(
            db,
            siteFeed.name,
            siteFeed.url,
            siteFeed.icon
          );

          siteCache = await getSite(db, siteFeed.name);
        }

        const res = await Promise.all(
          siteFeed.entries.map(async (entry) => {
            const existingEntry = await getEntry(db, siteCache.id, entry.link);

            if (!existingEntry) {
              await createEntry(
                db,
                siteCache.id,
                entry.title,
                entry.link,
                entry.content,
                entry.timestamp
              );

              return await getEntry(db, siteCache.id, entry.link);
            } else {
              return await existingEntry;
            }
          })
        );

        await db.close();

        console.log('job done');

        return resolve();
      } catch (ex) {
        console.error(ex);
        return reject(ex);
      }
    });
  },
  (err) => {
    console.error(err);
  }
);

module.exports = new SimpleIntervalJob({ minutes: 15 }, task);
