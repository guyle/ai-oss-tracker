'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import type { MetricHistory } from '@/lib/types';

interface StarHistoryChartProps {
  history: MetricHistory[];
}

export function StarHistoryChart({ history }: StarHistoryChartProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        No historical data available yet.
      </div>
    );
  }

  const data = history.map((entry) => ({
    date: formatDate(entry.recordedAt),
    stars: entry.stars,
    forks: entry.forks,
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
          <XAxis 
            dataKey="date" 
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            tickFormatter={formatNumber}
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#1f2937' }}
            formatter={(value: number) => formatNumber(value)}
          />
          <Line
            type="monotone"
            dataKey="stars"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            name="Stars"
          />
          <Line
            type="monotone"
            dataKey="forks"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Forks"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

