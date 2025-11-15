// Mock GitHub API response fixtures
import { createMockGitHubRepo } from '../helpers/mock-github.helper';

export const mockGitHubResponses = {
  tensorflow: createMockGitHubRepo({
    id: 45717250,
    full_name: 'tensorflow/tensorflow',
    name: 'tensorflow',
    description: 'An Open Source Machine Learning Framework for Everyone',
    html_url: 'https://github.com/tensorflow/tensorflow',
    homepage: 'https://tensorflow.org',
    language: 'Python',
    topics: ['machine-learning', 'deep-learning', 'tensorflow', 'neural-network', 'ml'],
    stargazers_count: 175000,
    forks_count: 88000,
    open_issues_count: 2100,
    watchers_count: 175000,
    created_at: '2015-11-07T01:19:20Z',
    updated_at: '2023-11-15T00:00:00Z',
    pushed_at: '2023-11-14T23:00:00Z',
    archived: false,
    license: {
      key: 'apache-2.0',
      name: 'Apache License 2.0',
      spdx_id: 'Apache-2.0',
      url: 'https://api.github.com/licenses/apache-2.0',
    },
  }),
  
  pytorch: createMockGitHubRepo({
    id: 65600975,
    full_name: 'pytorch/pytorch',
    name: 'pytorch',
    description: 'Tensors and Dynamic neural networks in Python with strong GPU acceleration',
    html_url: 'https://github.com/pytorch/pytorch',
    homepage: 'https://pytorch.org',
    language: 'Python',
    topics: ['machine-learning', 'deep-learning', 'pytorch', 'neural-network', 'gpu'],
    stargazers_count: 71000,
    forks_count: 19000,
    open_issues_count: 3500,
    watchers_count: 71000,
    created_at: '2016-08-13T17:56:37Z',
    updated_at: '2023-11-15T00:00:00Z',
    pushed_at: '2023-11-14T22:00:00Z',
    archived: false,
    license: {
      key: 'bsd-3-clause',
      name: 'BSD 3-Clause "New" or "Revised" License',
      spdx_id: 'BSD-3-Clause',
      url: 'https://api.github.com/licenses/bsd-3-clause',
    },
  }),
  
  langchain: createMockGitHubRepo({
    id: 552661142,
    full_name: 'langchain-ai/langchain',
    name: 'langchain',
    description: 'Building applications with LLMs through composability',
    html_url: 'https://github.com/langchain-ai/langchain',
    homepage: 'https://langchain.com',
    language: 'Python',
    topics: ['langchain', 'llm', 'ai', 'generative-ai', 'chatgpt'],
    stargazers_count: 65000,
    forks_count: 9000,
    open_issues_count: 1200,
    watchers_count: 65000,
    created_at: '2022-10-17T02:58:36Z',
    updated_at: '2023-11-15T00:00:00Z',
    pushed_at: '2023-11-15T01:00:00Z',
    archived: false,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
    },
  }),
};

export const mockSearchResponse = {
  withResults: {
    total_count: 3,
    incomplete_results: false,
    items: [
      mockGitHubResponses.tensorflow,
      mockGitHubResponses.pytorch,
      mockGitHubResponses.langchain,
    ],
  },
  
  empty: {
    total_count: 0,
    incomplete_results: false,
    items: [],
  },
};

