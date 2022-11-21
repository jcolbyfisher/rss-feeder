const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const feed = require('../meals/allSides');

const TASK_NAME = 'buildMenu';

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

function createSite(db, name, url, icon, lastFetchedAt) {
  return new Promise(function (resolve, reject) {
    db.run(
      `
        INSERT INTO sites (name, url, icon, lastFetchedAt) 
        VALUES ($name, $url, $icon, $lastFetchedAt)`,
      {
        $name: name,
        $url: url,
        $icon: icon,
        $lastFetchedAt: lastFetchedAt,
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

function updateSite(db, id, lastFetchedAt) {
  return new Promise(function (resolve, reject) {
    db.run(
      `
        UPDATE sites 
        SET lastFetchedAt=$lastFetchedAt
        WHERE id=$id
      `,
      {
        $id: id,
        $lastFetchedAt: lastFetchedAt,
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

function createEntry(db, siteId, title, url, content, timestamp, fetchedAt) {
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
        $timestamp: timestamp,
        $fetchedAt: fetchedAt,
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
  TASK_NAME,
  () => {
    console.log(TASK_NAME, 'starting task');

    return new Promise(async (resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, '../db/rss_feeder.sqlite')
      );

      try {
        const siteFeed = await feed();
        const fetchedAt = new Date().getTime();

        console.log(TASK_NAME, siteFeed.name, 'processing site');

        let siteCache = await getSite(db, siteFeed.name);

        if (siteCache) {
          await updateSite(db, siteCache.id, fetchedAt);

          siteCache.fetchedAt = fetchedAt;
        } else {
          siteCache = await createSite(
            db,
            siteFeed.name,
            siteFeed.url,
            siteFeed.icon,
            fetchedAt
          );

          siteCache = await getSite(db, siteFeed.name);
        }

        console.log(
          TASK_NAME,
          siteFeed.name,
          `processing 's ${siteFeed.entries.length} entries`
        );

        await Promise.all(
          siteFeed.entries.map(async (entry) => {
            try {
              const existingEntry = await getEntry(
                db,
                siteCache.id,
                entry.link
              );

              if (!existingEntry) {
                await createEntry(
                  db,
                  siteCache.id,
                  entry.title,
                  entry.link,
                  entry.content,
                  entry.timestamp,
                  fetchedAt
                );
              }

              return true;
            } catch (ex) {
              console.error(TASK_NAME, ex, {
                siteId: siteCache.id,
                title: entry.title,
                url: entry.link,
              });
            }
          })
        );

        console.log(TASK_NAME, siteCache.name, 'job done');

        return resolve();
      } catch (ex) {
        console.error(TASK_NAME, ex, 'task runtime error');
        return reject(ex);
      } finally {
        db.close();
      }
    });
  },
  (ex) => {
    console.error(TASK_NAME, ex, 'AsyncTask error');
  }
);

module.exports = new SimpleIntervalJob({ minutes: 15 }, task);
