// API client for communicating with the backend

import type {
  Project,
  ProjectDetails,
  ProjectsResponse,
  ProjectHistoryResponse,
  SystemStats,
  SortBy,
  Order,
} from './types';

// Use relative URLs in browser to leverage Next.js proxy, absolute URLs on server
const API_BASE_URL = typeof window === 'undefined' 
  ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  : ''; // Empty string for relative URLs in browser

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: { message: 'An error occurred' },
        }));
        throw new Error(error.error?.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error(`API Error fetching ${url}:`, error);
      throw error;
    }
  }


  async getProjects(params?: {
    page?: number;
    limit?: number;
    language?: string;
    topics?: string[];
    sortBy?: SortBy;
    order?: Order;
  }): Promise<ProjectsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.language) searchParams.set('language', params.language);
    if (params?.topics?.length) {
      params.topics.forEach((topic) => searchParams.append('topics', topic));
    }
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.order) searchParams.set('order', params.order);

    const query = searchParams.toString();
    return this.fetch<ProjectsResponse>(
      `/api/v1/projects${query ? `?${query}` : ''}`
    );
  }

  async getProject(id: number): Promise<ProjectDetails> {
    return this.fetch<ProjectDetails>(`/api/v1/projects/${id}`);
  }

  async getProjectHistory(
    id: number,
    params?: { from?: string; to?: string }
  ): Promise<ProjectHistoryResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);

    const query = searchParams.toString();
    return this.fetch<ProjectHistoryResponse>(
      `/api/v1/projects/${id}/history${query ? `?${query}` : ''}`
    );
  }

  async getStats(): Promise<SystemStats> {
    return this.fetch<SystemStats>('/api/v1/admin/stats');
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.fetch<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

