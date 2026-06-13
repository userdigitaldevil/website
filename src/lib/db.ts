import Database from 'better-sqlite3';
import path from 'path';
import { mkdirSync } from 'fs';
import bcrypt from 'bcryptjs';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    const dbDir = path.join(process.cwd(), 'data');
    mkdirSync(dbDir, { recursive: true });
    const dbPath = path.join(dbDir, 'site.db');
    _db = new Database(dbPath);
    _db.pragma('journal_mode = WAL');
    initDb(_db);
  }
  return _db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_name TEXT,
      category TEXT NOT NULL CHECK(category IN ('digital','iphone')),
      year INTEGER NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      youtube_url TEXT,
      filename TEXT,
      category TEXT NOT NULL DEFAULT 'videos',
      year INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      cover_image TEXT DEFAULT '',
      year INTEGER,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      referrer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_pv_created ON page_views(created_at);
    CREATE INDEX IF NOT EXISTS idx_pv_path ON page_views(path);
  `);

  // Migration: add year column to videos for existing databases
  const videoCols = db.prepare("PRAGMA table_info(videos)").all() as { name: string }[];
  if (!videoCols.some(c => c.name === 'year')) {
    db.exec('ALTER TABLE videos ADD COLUMN year INTEGER');
  }

  // Always sync admin password from env so changing ADMIN_PASSWORD in .env.local takes effect immediately
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(`
    INSERT INTO users (username, password_hash) VALUES ('admin', ?)
    ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash
  `).run(hash);

  // Seed default content entries
  const insertContent = db.prepare('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)');
  const defaults: [string, string][] = [
    ['site_name', 'YOUR NAME'],
    ['bio_text', 'Photographer based in ___. Available for editorial, commercial and personal work.'],
    ['bio_photo', ''],
    ['contact_email', 'you@email.com'],
    ['contact_email_2', ''],
    ['contact_youtube', '@yourchannel'],
    ['contact_instagram_1', '@yourhandle'],
    ['contact_instagram_2', ''],
    ['contact_instagram_3', ''],
    ['splash_image', ''],
    ['splash_video', ''],
    ['splash_music', ''],
    ['splash_text', ''],
    ['splash_text_mid', ''],
    ['splash_text_sub', ''],
    ['contact_text', ''],
    ['contact_image', ''],
    ['contact_image_2', ''],
    ['splash_image_bottom', ''],
    ['favicon', ''],
    ['enter_destination', '/digital'],
  ];
  for (const [key, val] of defaults) insertContent.run(key, val);
}

export type Photo = {
  id: number;
  filename: string;
  original_name: string | null;
  category: 'digital' | 'iphone';
  year: number;
  sort_order: number;
  created_at: string;
};

export type Video = {
  id: number;
  title: string | null;
  youtube_url: string | null;
  filename: string | null;
  category: string;
  year: number | null;
  sort_order: number;
  created_at: string;
};

export type Project = {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  year: number | null;
  sort_order: number;
  created_at: string;
};
