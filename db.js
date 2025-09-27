// db.js
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "events.db");

export async function initDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  // Pragmas for durability + decent perf
  await db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
  `);

  // Migrations
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      ts   TEXT NOT NULL,
      path TEXT NOT NULL,
      body TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_ts   ON events(ts DESC);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);

    CREATE TABLE IF NOT EXISTS outbound_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      destination TEXT NOT NULL,
      url TEXT NOT NULL,
      payload TEXT NOT NULL,
      status TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_error TEXT,
      next_attempt_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_outbound_pending ON outbound_attempts(status, next_attempt_at);
  `);

  return db;
}

// Insert if NOT exists (idempotent)
export async function insertEvent(db, { id, type, path, body }) {
  const ts = new Date().toISOString();
  await db.run(
    `INSERT OR IGNORE INTO events (id, type, ts, path, body) VALUES (?, ?, ?, ?, ?)`,
    [id, type, ts, path, JSON.stringify(body ?? {})]
  );
  // returns info via db.get changes count if needed, but not necessary here
}

// Simple filter/search with limit
export async function listEvents(db, { type, q, limit = 100 }) {
  const clauses = [];
  const params = [];

  if (type) {
    clauses.push(`type = ?`);
    params.push(type);
  }
  if (q) {
    // Search id/type/path/body
    clauses.push(`(LOWER(id) LIKE ? OR LOWER(type) LIKE ? OR LOWER(path) LIKE ? OR LOWER(body) LIKE ?)`);
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like, like, like);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const n = Math.min(parseInt(limit, 10) || 100, 500);

  return db.all(
    `SELECT id, type, ts, path, substr(body, 1, 1200) as body_preview
     FROM events
     ${where}
     ORDER BY ts DESC
     LIMIT ?`,
    [...params, n]
  );
}

export async function getEventById(db, id) {
  return db.get(`SELECT id, type, ts, path, body FROM events WHERE id = ?`, [id]);
}