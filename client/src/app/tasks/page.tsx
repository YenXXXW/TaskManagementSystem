import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import TaskList from '@/components/TaskList';
import { api } from '@/utils/api';

export default async function TasksPage() {
  {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;


    if (!token) {
      redirect('/auth/login');
    }

    const tasks = await api.tasks.getAll(token);


    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto">
          <TaskList tasks={tasks} />
        </div>
      </div>
    );
  }
}
