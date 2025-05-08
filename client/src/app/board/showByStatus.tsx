import { api, Task } from "@/utils/api"
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from "next/link";

const TaskColumn = ({ title, tasks }: { title: string; tasks: Task[] }) => (
  <div className="shadow-md rounded-lg p-1">
    <h2 className="text-md font-semibold rounded-md text-gray-700 capitalize p-2 mb-4">
      {title}
    </h2>
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tasks {title.toLowerCase()}</p>
      ) : (
        tasks.map((task) => (
          <Link
            key={task._id}
            href={`/tasks/${task._id}`}>
            <div
              className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
            >
              <h3 className="mb-2">{task.title}</h3>
              <p className="ml-1 text-sm text-gray-600 mb-3">
                {task.description || "No Description"}
              </p>
              <span
                className={`
                text-xs font-medium px-2 py-0.5 rounded-full
                ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'}
              `}
              >
                {task.priority}
              </span>
              <p className="ml-1 text-xs text-gray-400 mt-1">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  </div >
)

export default async function ShowByStatusPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/auth/login');
  }

  const { pending, inProgress, completed } = await api.tasks.getByStatus({ token });

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
      <TaskColumn title="Pending" tasks={pending} />
      <TaskColumn title="In Progress" tasks={inProgress} />
      <TaskColumn title="Completed" tasks={completed} />
    </div>
  )
}

