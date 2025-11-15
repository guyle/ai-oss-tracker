import Link from 'next/link';
import { formatNumber, formatRelativeTime, getLanguageColor } from '@/lib/utils';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 p-6 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {project.fullName}
            </p>
          </div>
          {project.language && (
            <div className="flex items-center ml-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getLanguageColor(project.language) }}
              />
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 h-10">
          {project.description || 'No description available'}
        </p>

        {/* Topics */}
        {project.topics && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
              >
                {topic}
              </span>
            ))}
            {project.topics.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                +{project.topics.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="mr-1">⭐</span>
              <span className="font-semibold">{formatNumber(project.stars)}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="mr-1">🍴</span>
              <span className="font-semibold">{formatNumber(project.forks)}</span>
            </div>
          </div>
          {project.starsVelocity !== null && project.starsVelocity > 0 && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <span className="mr-1">📈</span>
              <span className="font-semibold">+{formatNumber(project.starsVelocity)}/day</span>
            </div>
          )}
        </div>

        {/* Language */}
        {project.language && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{project.language}</span>
              <span>{formatRelativeTime(project.lastUpdated)}</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

