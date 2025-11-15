# Database Schema

## Tables

### projects
Stores information about tracked GitHub projects.

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  full_name VARCHAR(255) UNIQUE NOT NULL, -- e.g., "microsoft/vscode"
  name VARCHAR(255) NOT NULL,
  description TEXT,
  html_url VARCHAR(500) NOT NULL,
  homepage VARCHAR(500),
  language VARCHAR(50),
  topics TEXT[], -- Array of topic tags
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  pushed_at TIMESTAMP,
  is_fork BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  license VARCHAR(100),
  
  -- Tracking metadata
  first_tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_language ON projects(language);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_topics ON projects USING GIN(topics);
```

### project_metrics
Time-series data for project metrics (stars, forks, etc).

```sql
CREATE TABLE project_metrics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metrics
  stars_count INTEGER NOT NULL,
  forks_count INTEGER NOT NULL,
  watchers_count INTEGER NOT NULL,
  open_issues_count INTEGER NOT NULL,
  
  -- Calculated fields
  stars_gained_24h INTEGER,
  stars_gained_7d INTEGER,
  stars_velocity DECIMAL(10, 2), -- Stars per day
  
  UNIQUE(project_id, recorded_at)
);

CREATE INDEX idx_project_metrics_project_recorded ON project_metrics(project_id, recorded_at DESC);
CREATE INDEX idx_project_metrics_recorded_at ON project_metrics(recorded_at DESC);
CREATE INDEX idx_project_metrics_velocity ON project_metrics(stars_velocity DESC);
```

### trending_snapshots
Captures GitHub's trending page at regular intervals.

```sql
CREATE TABLE trending_snapshots (
  id SERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL,
  snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  language VARCHAR(50), -- NULL for "all languages"
  time_range VARCHAR(20), -- 'daily', 'weekly', 'monthly'
  rank INTEGER NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  
  UNIQUE(snapshot_date, language, time_range, rank)
);

CREATE INDEX idx_trending_snapshots_date ON trending_snapshots(snapshot_date DESC);
CREATE INDEX idx_trending_snapshots_project ON trending_snapshots(project_id, snapshot_date DESC);
```

### project_topics
Many-to-many relationship for AI-related topics.

```sql
CREATE TABLE project_topics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(project_id, topic)
);

CREATE INDEX idx_project_topics_topic ON project_topics(topic);
CREATE INDEX idx_project_topics_project_id ON project_topics(project_id);
```

### alerts
Tracks alert rules and notifications sent.

```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'star_velocity', 'new_trending', etc.
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criteria JSONB NOT NULL, -- Alert criteria that triggered
  metadata JSONB, -- Additional context
  notified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_alerts_project ON alerts(project_id, triggered_at DESC);
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
```

## Views

### current_project_stats
Latest metrics for each project.

```sql
CREATE VIEW current_project_stats AS
SELECT 
  p.id,
  p.full_name,
  p.language,
  pm.stars_count,
  pm.forks_count,
  pm.stars_velocity,
  pm.stars_gained_7d,
  pm.recorded_at as last_update
FROM projects p
JOIN LATERAL (
  SELECT *
  FROM project_metrics
  WHERE project_id = p.id
  ORDER BY recorded_at DESC
  LIMIT 1
) pm ON true;
```

## Performance Considerations

- **Partitioning**: Consider partitioning `project_metrics` by date for datasets > 1M rows
- **Indexes**: GIN index on topics array enables fast filtering
- **Maintenance**: Schedule regular VACUUM ANALYZE for query performance
- **Archival**: Archive old metrics data (> 1 year) to separate table
