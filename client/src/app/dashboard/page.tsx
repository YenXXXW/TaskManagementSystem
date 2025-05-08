'use client'

import TaskStats from '@/components/TaskStats';
import { useAppSelector } from '@/state/hooks';
import { useRouter } from 'next/router';

export default function DashboardPage() {

  const router = useRouter()

  const token = useAppSelector(state => state.user.token)


  if (!token) {
    router.push('/auth/login')
  }


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="">
        <TaskStats />
      </div>
    </div>
  );
}



