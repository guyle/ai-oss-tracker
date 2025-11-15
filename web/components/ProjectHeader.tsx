import { formatRelativeTime, getLanguageColor } from '@/lib/utils';
import type { ProjectDetails } from '@/lib/types';

interface ProjectHeaderProps {
  project: ProjectDetails;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            {project.isArchived && (
              <span className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                Archived
              </span>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            {project.fullName}
          </p>
          {project.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Topics */}
      {project.topics && project.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.topics.map((topic) => (
            <span
              key={topic}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        {project.language && (
          <div className="flex items-center">
            <span
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: getLanguageColor(project.language) }}
            />
            <span className="text-gray-700 dark:text-gray-300">{project.language}</span>
          </div>
        )}
        {project.license && (
          <div className="text-gray-700 dark:text-gray-300">
            <span className="mr-2">📄</span>
            {project.license}
          </div>
        )}
        <div className="text-gray-700 dark:text-gray-300">
          Created {formatRelativeTime(project.createdAt)}
        </div>
        {project.homepage && (
          <a
            href={project.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            🔗 Homepage
          </a>
        )}
      </div>

      {/* Links */}
      <div className="flex gap-4 mt-6">
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition font-medium"
        >
          View on GitHub →
        </a>
      </div>
    </div>
  );
}

