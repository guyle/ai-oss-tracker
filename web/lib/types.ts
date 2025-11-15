// Shared types between backend and frontend

export interface Project {
  id: number;
  fullName: string;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  starsVelocity: number | null;
  starsGained7d: number | null;
  topics: string[];
  url: string;
  lastUpdated: string;
  homepage?: string | null;
  license?: string | null;
  isArchived?: boolean;
  createdAt?: string;
  firstTrackedAt?: string;
}

export interface ProjectDetails extends Project {
  homepage: string | null;
  license: string | null;
  isArchived: boolean;
  createdAt: string;
  firstTrackedAt: string;
  currentMetrics: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    starsVelocity: number | null;
    starsGained24h: number | null;
    starsGained7d: number | null;
  };
}

export interface MetricHistory {
  recordedAt: string;
  stars: number;
  forks: number;
  watchers: number;
  starsGained: number;
}

export interface ProjectHistoryResponse {
  projectId: number;
  fullName: string;
  history: MetricHistory[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

export interface ProjectsResponse {
  data: Project[];
  pagination: Pagination;
}

export interface SystemStats {
  totalProjects: number;
  totalMetrics: number;
  lastSync: string | null;
  apiQuota: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
  health: {
    database: string;
    github: string;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type SortBy = 'stars' | 'velocity' | 'created';
export type Order = 'asc' | 'desc';

