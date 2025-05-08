import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import TaskList from '@/components/TaskList';
import { api } from '@/utils/api';
import TaskStats from '@/components/TaskStats';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const tasks = await fetchTasksFromServer(token);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
    pending: tasks.filter(task => task.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="">
        <TaskStats />
      </div>
    </div>
  );
}



async function fetchTasksFromServer(token: string) {
  const res = await api.tasks.getAll(token)
  console.log(res)

  return res;
}
