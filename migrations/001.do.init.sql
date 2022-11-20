CREATE TABLE
  sites (
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    icon TEXT NOT NULL,
    lastFetchedAt INTEGER NOT NULL
  );

CREATE UNIQUE INDEX idx_sites_name ON sites (name);

CREATE TABLE
  IF NOT EXISTS entries (
    id INTEGER NOT NULL PRIMARY KEY,
    siteId INTEGER NOT NULL,
    url TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    fetchedAt INTEGER NOT NULL,
    FOREIGN KEY (siteId) REFERENCES sites (id),
    UNIQUE (siteId, url) ON CONFLICT REPLACE
  );

CREATE INDEX idx_entries_siteId ON entries (siteId);

CREATE INDEX idx_entries_url ON entries (url);