import { api } from "@/utils/api"
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import BoardToggle from "./BoardToggle";
import ShowByStatusPage from "./showByStatus";
import ShowByPriorityPage from "./showByPriority";

export default async function BoardPage({ searchParams }: { searchParams: { view?: string } }) {
  const view = searchParams.view || 'status';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {

    redirect('/auth/login')
  }


  const { pending, inProgress, completed
  } = await api.tasks.getByStatus({ token })

  return (
    <div>
      <BoardToggle />

      {view === 'priority' ? (
        <ShowByPriorityPage />
      ) : (
        <ShowByStatusPage />
      )}
    </div>
  )
}
