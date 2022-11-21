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

module.exports = { getSite, createSite, updateSite };
