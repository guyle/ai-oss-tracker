import { apiClient } from '@/lib/api';
import { ProjectCard } from './ProjectCard';
import { Pagination } from './Pagination';
import type { SortBy, Order } from '@/lib/types';

interface ProjectsListProps {
  page: number;
  language?: string;
  sortBy: SortBy;
  order: Order;
}

export async function ProjectsList({ page, language, sortBy, order }: ProjectsListProps) {
  let response;
  
  try {
    response = await apiClient.getProjects({
      page,
      limit: 12,
      language,
      sortBy,
      order,
    });
  } catch (error) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-red-600 dark:text-red-400">
          Failed to load projects. Make sure the backend is running on port 3000.
        </p>
      </div>
    );
  }

  if (response.data.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 dark:text-gray-400">
          No projects found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {response.data.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <Pagination pagination={response.pagination} />
    </div>
  );
}

