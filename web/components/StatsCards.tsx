import { apiClient } from '@/lib/api';
import { formatNumber } from '@/lib/utils';

export async function StatsCards() {
  let stats;
  
  try {
    stats = await apiClient.getStats();
  } catch (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        Failed to load stats. Make sure the backend is running on port 3000.
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Projects',
      value: formatNumber(stats.totalProjects),
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Metrics',
      value: formatNumber(stats.totalMetrics),
      icon: '📊',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'API Remaining',
      value: formatNumber(stats.apiQuota?.remaining),
      icon: '🔥',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'System Health',
      value: stats.health?.database === 'healthy' ? 'Healthy' : 'Issues',
      icon: '💚',
      color: 'from-teal-500 to-teal-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{card.icon}</span>
            <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${card.color}`} />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {card.value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
}

