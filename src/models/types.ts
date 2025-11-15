// Type definitions for GitHub AI Tracker

export interface Project {
  id: number;
  github_id: number;
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  created_at: Date;
  updated_at: Date;
  pushed_at: Date | null;
  is_fork: boolean;
  is_archived: boolean;
  license: string | null;
  first_tracked_at: Date;
  last_synced_at: Date;
}

export interface ProjectMetrics {
  id: number;
  project_id: number;
  recorded_at: Date;
  stars_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  stars_gained_24h: number;
  stars_gained_7d: number;
  stars_velocity: number;
}

export interface TrendingSnapshot {
  id: number;
  snapshot_date: Date;
  snapshot_time: Date;
  language: string | null;
  time_range: string;
  rank: number;
  project_id: number;
}

export interface Alert {
  id: number;
  project_id: number;
  alert_type: string;
  triggered_at: Date;
  criteria: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  notified: boolean;
}

export interface ProjectWithMetrics extends Project {
  current_metrics?: ProjectMetrics;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface ProjectFilters {
  language?: string;
  topics?: string[];
  sortBy?: string;
  order?: 'asc' | 'desc' | 'ASC' | 'DESC';
  minStars?: number;
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface GitHubRepoData {
  id: number;
  full_name: string;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  fork: boolean;
  archived: boolean;
  license: {
    spdx_id: string;
  } | null;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: Date;
}

