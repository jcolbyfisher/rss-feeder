function getSite(db, name) {
  return new Promise(function (resolve, reject) {
    db.get(
      `SELECT * FROM sites where name=$name;`,
      {
        $name: name,
      },
      function (err, data) {
        return err ? reject(err) : resolve(data);
      }
    );
  });
}

function createSite(db, name, url, icon, lastFetchedAt) {
  return new Promise(function (resolve, reject) {
    db.run(
      `
        INSERT INTO sites (name, url, icon, lastFetchedAt) 
        VALUES ($name, $url, $icon, $lastFetchedAt);`,
      {
        $name: name,
        $url: url,
        $icon: icon,
        $lastFetchedAt: lastFetchedAt,
      },
      function (err) {
        return err ? reject(err) : resolve(this);
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
        WHERE id=$id;
      `,
      {
        $id: id,
        $lastFetchedAt: lastFetchedAt,
      },
      function (err) {
        return err ? reject(err) : resolve(this);
      }
    );
  });
}

module.exports = { getSite, createSite, updateSite };
