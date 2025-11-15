// Test project fixtures

export const mockProjects = {
  tensorflow: {
    github_id: 45717250,
    full_name: 'tensorflow/tensorflow',
    name: 'tensorflow',
    description: 'An Open Source Machine Learning Framework for Everyone',
    html_url: 'https://github.com/tensorflow/tensorflow',
    homepage: 'https://tensorflow.org',
    language: 'Python',
    topics: ['machine-learning', 'deep-learning', 'tensorflow', 'neural-network', 'ml'],
    created_at: new Date('2015-11-07T01:19:20Z'),
    updated_at: new Date('2023-11-15T00:00:00Z'),
    pushed_at: new Date('2023-11-14T23:00:00Z'),
    is_fork: false,
    is_archived: false,
    license: 'Apache-2.0',
  },
  
  pytorch: {
    github_id: 65600975,
    full_name: 'pytorch/pytorch',
    name: 'pytorch',
    description: 'Tensors and Dynamic neural networks in Python with strong GPU acceleration',
    html_url: 'https://github.com/pytorch/pytorch',
    homepage: 'https://pytorch.org',
    language: 'Python',
    topics: ['machine-learning', 'deep-learning', 'pytorch', 'neural-network', 'gpu'],
    created_at: new Date('2016-08-13T17:56:37Z'),
    updated_at: new Date('2023-11-15T00:00:00Z'),
    pushed_at: new Date('2023-11-14T22:00:00Z'),
    is_fork: false,
    is_archived: false,
    license: 'BSD-3-Clause',
  },
  
  langchain: {
    github_id: 552661142,
    full_name: 'langchain-ai/langchain',
    name: 'langchain',
    description: 'Building applications with LLMs through composability',
    html_url: 'https://github.com/langchain-ai/langchain',
    homepage: 'https://langchain.com',
    language: 'Python',
    topics: ['langchain', 'llm', 'ai', 'generative-ai', 'chatgpt'],
    created_at: new Date('2022-10-17T02:58:36Z'),
    updated_at: new Date('2023-11-15T00:00:00Z'),
    pushed_at: new Date('2023-11-15T01:00:00Z'),
    is_fork: false,
    is_archived: false,
    license: 'MIT',
  },
  
  huggingface: {
    github_id: 155220641,
    full_name: 'huggingface/transformers',
    name: 'transformers',
    description: 'State-of-the-art Machine Learning for PyTorch, TensorFlow, and JAX',
    html_url: 'https://github.com/huggingface/transformers',
    homepage: 'https://huggingface.co/transformers',
    language: 'Python',
    topics: ['transformers', 'nlp', 'deep-learning', 'pytorch', 'tensorflow', 'bert'],
    created_at: new Date('2018-10-29T13:56:00Z'),
    updated_at: new Date('2023-11-15T00:00:00Z'),
    pushed_at: new Date('2023-11-14T20:00:00Z'),
    is_fork: false,
    is_archived: false,
    license: 'Apache-2.0',
  },
  
  // Archived project for testing
  archived: {
    github_id: 99999999,
    full_name: 'old/archived-ai',
    name: 'archived-ai',
    description: 'This project is no longer maintained',
    html_url: 'https://github.com/old/archived-ai',
    homepage: null,
    language: 'Python',
    topics: ['ai', 'deprecated'],
    created_at: new Date('2019-01-01T00:00:00Z'),
    updated_at: new Date('2020-01-01T00:00:00Z'),
    pushed_at: new Date('2020-01-01T00:00:00Z'),
    is_fork: false,
    is_archived: true,
    license: 'MIT',
  },
};

export const mockMetrics = {
  tensorflow: {
    stars_count: 175000,
    forks_count: 88000,
    open_issues_count: 2100,
    watchers_count: 175000,
  },
  
  pytorch: {
    stars_count: 71000,
    forks_count: 19000,
    open_issues_count: 3500,
    watchers_count: 71000,
  },
  
  langchain: {
    stars_count: 65000,
    forks_count: 9000,
    open_issues_count: 1200,
    watchers_count: 65000,
  },
  
  huggingface: {
    stars_count: 118000,
    forks_count: 23500,
    open_issues_count: 800,
    watchers_count: 118000,
  },
};

