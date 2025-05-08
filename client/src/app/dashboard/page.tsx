import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import TaskStats from '@/components/TaskStats';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  console.log("token is", token)
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



