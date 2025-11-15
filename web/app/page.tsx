import { Suspense } from 'react';
import { ProjectsList } from '@/components/ProjectsList';
import { StatsCards } from '@/components/StatsCards';
import { Filters } from '@/components/Filters';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface PageProps {
  searchParams: {
    page?: string;
    language?: string;
    sortBy?: string;
    order?: string;
  };
}

export default function HomePage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const language = searchParams.language;
  const sortBy = (searchParams.sortBy as 'stars' | 'velocity' | 'created') || 'stars';
  const order = (searchParams.order as 'asc' | 'desc') || 'desc';

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          AI OSS Tracker
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover and track the most trending AI open source projects on GitHub
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="h-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
        <StatsCards />
      </Suspense>

      {/* Filters */}
      <Filters />

      {/* Projects List */}
      <Suspense
        key={`${page}-${language}-${sortBy}-${order}`}
        fallback={
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        <ProjectsList
          page={page}
          language={language}
          sortBy={sortBy}
          order={order}
        />
      </Suspense>
    </div>
  );
}

