'use client'

import { useRouter } from 'next/navigation';
import BoardToggle from './BoardToggle';
import ShowByStatusPage from './showByStatus';
import ShowByPriorityPage from './showByPriority';
import { useAppSelector } from '@/state/hooks';

export default function BoardPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view || 'status';
  const router = useRouter();
  const token = useAppSelector(state => state.user.token)

  if (token === '') {
    router.push('/auth/login');
  }

  return (
    <div>
      <BoardToggle />
      {view === 'priority' ? <ShowByPriorityPage /> : <ShowByStatusPage />}
    </div>
  );
}
