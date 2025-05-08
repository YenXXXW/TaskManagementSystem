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
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
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


  return (
    <TaskDetail task={task} />
  );
};
export default TaskPage;

