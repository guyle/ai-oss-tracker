-- GitHub AI Trending Tracker Database Schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  full_name VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  html_url VARCHAR(500) NOT NULL,
  homepage VARCHAR(500),
  language VARCHAR(50),
  topics TEXT[],
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  pushed_at TIMESTAMP,
  is_fork BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  license VARCHAR(100),
  first_tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project metrics (time-series data)
CREATE TABLE IF NOT EXISTS project_metrics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stars_count INTEGER NOT NULL,
  forks_count INTEGER NOT NULL,
  watchers_count INTEGER NOT NULL,
  open_issues_count INTEGER NOT NULL,
  stars_gained_24h INTEGER DEFAULT 0,
  stars_gained_7d INTEGER DEFAULT 0,
  stars_velocity DECIMAL(10, 2) DEFAULT 0,
  UNIQUE(project_id, recorded_at)
);

-- Trending snapshots
CREATE TABLE IF NOT EXISTS trending_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  language VARCHAR(50),
  time_range VARCHAR(20),
  rank INTEGER NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  UNIQUE(snapshot_date, language, time_range, rank)
);

-- Project topics (many-to-many)
CREATE TABLE IF NOT EXISTS project_topics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, topic)
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criteria JSONB NOT NULL,
  metadata JSONB,
  notified BOOLEAN DEFAULT FALSE
);

-- Indexes for performance

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_language ON projects(language);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_topics ON projects USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_projects_full_name ON projects(full_name);

-- Project metrics indexes
CREATE INDEX IF NOT EXISTS idx_project_metrics_project_recorded ON project_metrics(project_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_metrics_recorded_at ON project_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_metrics_velocity ON project_metrics(stars_velocity DESC);

-- Trending snapshots indexes
CREATE INDEX IF NOT EXISTS idx_trending_snapshots_date ON trending_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_trending_snapshots_project ON trending_snapshots(project_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_trending_snapshots_language ON trending_snapshots(language, snapshot_date DESC);

-- Project topics indexes
CREATE INDEX IF NOT EXISTS idx_project_topics_topic ON project_topics(topic);
CREATE INDEX IF NOT EXISTS idx_project_topics_project_id ON project_topics(project_id);

-- Alerts indexes
CREATE INDEX IF NOT EXISTS idx_alerts_project ON alerts(project_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_notified ON alerts(notified) WHERE notified = FALSE;

-- View: Current project stats
CREATE OR REPLACE VIEW current_project_stats AS
SELECT 
  p.id,
  p.full_name,
  p.name,
  p.language,
  p.description,
  p.html_url,
  p.topics,
  pm.stars_count,
  pm.forks_count,
  pm.watchers_count,
  pm.stars_velocity,
  pm.stars_gained_24h,
  pm.stars_gained_7d,
  pm.recorded_at as last_update
FROM projects p
LEFT JOIN LATERAL (
  SELECT *
  FROM project_metrics
  WHERE project_id = p.id
  ORDER BY recorded_at DESC
  LIMIT 1
) pm ON true;

-- View: Top gainers (7 days)
CREATE OR REPLACE VIEW top_gainers_7d AS
SELECT 
  p.id,
  p.full_name,
  p.name,
  p.language,
  pm.stars_count as current_stars,
  pm.stars_gained_7d,
  pm.stars_velocity,
  pm.recorded_at as last_update
FROM projects p
JOIN LATERAL (
  SELECT *
  FROM project_metrics
  WHERE project_id = p.id
  ORDER BY recorded_at DESC
  LIMIT 1
) pm ON true
WHERE pm.stars_gained_7d > 0
ORDER BY pm.stars_gained_7d DESC;

