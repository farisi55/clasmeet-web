CREATE TABLE IF NOT EXISTS classmate_kontak (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kota TEXT NOT NULL,
  kontak TEXT NOT NULL,
  pesan TEXT NOT NULL,
  source_kontak TEXT NOT NULL DEFAULT 'web',
  user_agent TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_classmate_kontak_created_at
ON classmate_kontak(created_at);

CREATE INDEX IF NOT EXISTS idx_classmate_kontak_source
ON classmate_kontak(source_kontak);
