import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BoardToggle from "./BoardToggle";
import ShowByStatusPage from "./showByStatus";
import ShowByPriorityPage from "./showByPriority";

export default function BoardPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view || 'status';
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  return (
    <div>
      <BoardToggle />
      {view === 'priority' ? (
        <ShowByPriorityPage />
      ) : (
        <ShowByStatusPage />
      )}
    </div>
  );
}
