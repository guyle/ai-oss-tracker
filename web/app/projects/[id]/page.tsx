import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ProjectHeader } from '@/components/ProjectHeader';
import { ProjectMetrics } from '@/components/ProjectMetrics';
import { StarHistoryChart } from '@/components/StarHistoryChart';
import { BackButton } from '@/components/BackButton';

interface PageProps {
  params: {
    id: string;
  };
}

async function getProjectData(id: number) {
  try {
    const [project, history] = await Promise.all([
      apiClient.getProject(id),
      apiClient.getProjectHistory(id),
    ]);
    return { project, history };
  } catch (error) {
    return null;
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    notFound();
  }

  const data = await getProjectData(id);
  
  if (!data) {
    notFound();
  }

  const { project, history } = data;

  return (
    <div className="space-y-8">
      <BackButton />

      <ProjectHeader project={project} />

      <ProjectMetrics project={project} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Star History
        </h2>
        <StarHistoryChart history={history.history} />
      </div>
    </div>
  );
}

