import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { api } from '@/utils/api';
import TaskStats from '@/components/TaskStats';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }



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
