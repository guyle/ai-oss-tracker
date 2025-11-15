'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Ruby'];
const SORT_OPTIONS = [
  { value: 'stars', label: 'Most Stars' },
  { value: 'velocity', label: 'Highest Velocity' },
  { value: 'created', label: 'Recently Created' },
];

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'stars');

  const updateFilters = (newLanguage: string, newSortBy: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newLanguage) {
      params.set('language', newLanguage);
    } else {
      params.delete('language');
    }
    
    if (newSortBy !== 'stars') {
      params.set('sortBy', newSortBy);
    } else {
      params.delete('sortBy');
    }
    
    params.delete('page'); // Reset to page 1 when filtering
    
    router.push(`/?${params.toString()}`);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    updateFilters(value, sortBy);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    updateFilters(language, value);
  };

  const clearFilters = () => {
    setLanguage('');
    setSortBy('stars');
    router.push('/');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

