import BoardToggle from "./BoardToggle";
import ShowByStatusPage from "./showByStatus";
import ShowByPriorityPage from "./showByPriority";
import { useRouter } from 'next/router';
import { useAppSelector } from '@/state/hooks';
import { useSearchParams } from "next/navigation";

export default function BoardPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  const router = useRouter()

  const token = useAppSelector(state => state.user.token)


  if (!token) {
    router.push('/auth/login')
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
  )
}

