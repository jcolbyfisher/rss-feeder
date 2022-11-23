function getEntry(db, siteId, url) {
  return new Promise(function (resolve, reject) {
    db.get(
      `
        SELECT * 
        FROM entries
        WHERE siteId=$siteId AND url=$url;
      `,
      {
        $siteId: siteId,
        $url: url,
      },
      function (err, data) {
        return err ? reject(err) : resolve(data);
      }
    );
  });
}

function createEntry(db, siteId, title, url, content, timestamp, fetchedAt) {
  return new Promise(function (resolve, reject) {
    db.run(
      `
        INSERT INTO entries (siteId, title, url, content, timestamp, fetchedAt) 
        VALUES ($siteId, $title, $url, $content, $timestamp, $fetchedAt);
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
        return err ? reject(err) : resolve(this);
      }
    );
  });
}

function getLatestEntriesForSite(db, siteId) {
  return new Promise(function (resolve, reject) {
    db.all(
      `
        SELECT * 
        FROM entries
        WHERE siteId=$siteId
        ORDER BY id DESC
        LIMIT 15;
      `,
      {
        $siteId: siteId,
      },
      function (err, data) {
        return err ? reject(err) : resolve(data);
      }
    );
  });
}

module.exports = { getEntry, createEntry, getLatestEntriesForSite };
