import Postgrator from 'postgrator';
import sqlite3 from 'sqlite3';
import path from 'path';
import pino from 'pino';

const logger = pino();

async function migrate() {
  logger.info('MIGRATION: Starting migrations.');

  const db = new sqlite3.Database(path.join('./db/rss_feeder.sqlite'));

  const execQuery = (query) => {
    return new Promise((resolve, reject) => {
      db.all(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve({ rows });
      });
    });
  };

  try {
    const postgrator = new Postgrator({
      migrationPattern: path.join('./migrations/*'),
      driver: 'sqlite3',
      schemaTable: 'migrations',
      execQuery,
    });

    const result = await postgrator.migrate();

    if (result.length === 0) {
      logger.info('MIGRATION: No migrations run; already at the latest one.');
    }

    logger.info('MIGRATION: Done.');

    process.exitCode = 0;
  } catch (err) {
    logger.error(err);
    process.exitCode = 1;
  }

  db.close();
}

migrate();
