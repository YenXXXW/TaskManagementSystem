'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Task } from '@/utils/api';
import TaskDetail from '@/components/TaskDetails';

const TaskPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        console.log(taskId)
        const res = await api.tasks.getById(taskId as string);
        setTask(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchTask();
    }
  }, [taskId]);

  if (loading) return <div>Loading task...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div>No task found.</div>;

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
  }[task.status];

  const priorityColor = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600 font-semibold',
  }[task.priority];

  return (
    <TaskDetail task={task} />
  );
};
export default TaskPage;

