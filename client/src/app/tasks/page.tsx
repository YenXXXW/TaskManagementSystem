'use client'

import TaskList from '@/components/TaskList';
import { useAppSelector } from '@/state/hooks';
import { api, Task } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TasksPage() {
  const router = useRouter()
  const token = useAppSelector(state => state.user.token)
  const [tasks, setTasks] = useState<Task[]>([])
  {


    if (!token) {
      router.push('/auth/login')
    }

    const fetchTasks = async () => {

      const tasks = await api.tasks.getAll(token);
      setTasks(tasks)
    }
    useEffect(() => {
      if (token !== '') {
        fetchTasks
      }

    }, [token])



    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto">
          <TaskList tasks={tasks} />
        </div>
      </div>
    );
  }
}
