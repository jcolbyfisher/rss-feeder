const { SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const feed = require('../meals/allSides');

const { getSite, createSite, updateSite } = require('../daos/sites');
const { getEntry, createEntry } = require('../daos/entries');

const TASK_NAME = 'buildMenu';

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
