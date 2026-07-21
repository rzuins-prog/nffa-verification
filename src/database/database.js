const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const { SCHEMA } = require("./migrations");

function createDatabase(filename) {
  if (filename !== ":memory:") fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

module.exports = { createDatabase };
