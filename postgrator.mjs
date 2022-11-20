import Postgrator from 'postgrator';
import sqlite3 from 'sqlite3';
import path from 'path';

async function migrate() {
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
      console.log(
        'No migrations run for schema "public". Already at the latest one.'
      );
    }

    console.log('Migration done.');

    process.exitCode = 0;
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }

  await db.close();
}

migrate();
