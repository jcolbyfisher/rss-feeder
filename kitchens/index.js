const path = require('path');
const logger = require('pino')();
const sqlite3 = require('sqlite3').verbose();

const { getSite, createSite, updateSite } = require('../daos/sites');
const { getEntry, createEntry } = require('../daos/entries');

const feed = require('../meals/allSides');

module.exports = () =>
  new Promise(async (resolve, reject) => {
    logger.info(`KITCHEN: Turning on the burners`);

    const db = new sqlite3.Database(
      path.join(__dirname, '../db/rss_feeder.sqlite')
    );

    try {
      const siteFeed = await feed();
      const fetchedAt = new Date().getTime();

      logger.info(`KITCHEN: Cooking site: ${siteFeed.name}`);

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

      logger.info(
        `KITCHEN: Processing ${siteFeed.name}'s ${siteFeed.entries.length} entries`
      );

      await Promise.all(
        siteFeed.entries.reverse().map(async (entry) => {
          try {
            const existingEntry = await getEntry(db, siteCache.id, entry.link);

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
            logger.error(
              `KITCHEN: Error processing ${siteFeed.name}'s entry: (title: ${entry.title}, url: ${entry.link})`
            );
          }
        })
      );

      logger.info(`KITCHEN: Done processing ${siteFeed.name}`);

      resolve(true);
    } catch (ex) {
      logger.error(`KITCHEN: Runtime error`);
      logger.error(ex);

      reject(ex);
    } finally {
      db.close();
    }
  });
