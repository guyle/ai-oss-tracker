import { formatNumber } from '@/lib/utils';
import type { ProjectDetails } from '@/lib/types';

interface ProjectMetricsProps {
  project: ProjectDetails;
}

export function ProjectMetrics({ project }: ProjectMetricsProps) {
  const metrics = [
    {
      label: 'Stars',
      value: formatNumber(project.currentMetrics.stars),
      icon: '⭐',
      color: 'from-yellow-400 to-yellow-600',
    },
    {
      label: 'Forks',
      value: formatNumber(project.currentMetrics.forks),
      icon: '🍴',
      color: 'from-blue-400 to-blue-600',
    },
    {
      label: 'Watchers',
      value: formatNumber(project.currentMetrics.watchers),
      icon: '👁️',
      color: 'from-purple-400 to-purple-600',
    },
    {
      label: 'Open Issues',
      value: formatNumber(project.currentMetrics.openIssues),
      icon: '🐛',
      color: 'from-red-400 to-red-600',
    },
  ];

  const growthMetrics = [
    {
      label: 'Stars Gained (24h)',
      value: project.currentMetrics.starsGained24h !== null 
        ? `+${formatNumber(project.currentMetrics.starsGained24h)}` 
        : 'N/A',
      icon: '📈',
    },
    {
      label: 'Stars Gained (7d)',
      value: project.currentMetrics.starsGained7d !== null 
        ? `+${formatNumber(project.currentMetrics.starsGained7d)}` 
        : 'N/A',
      icon: '🚀',
    },
    {
      label: 'Daily Velocity',
      value: project.currentMetrics.starsVelocity !== null 
        ? `+${formatNumber(project.currentMetrics.starsVelocity)}/day` 
        : 'N/A',
      icon: '⚡',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{metric.icon}</span>
              <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${metric.color}`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Growth Metrics */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Growth Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {growthMetrics.map((metric, index) => (
            <div key={index} className="flex items-center">
              <span className="text-2xl mr-3">{metric.icon}</span>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {metric.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

