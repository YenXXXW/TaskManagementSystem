import { api } from "@/utils/api"
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function ShowByPriorityPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {

    redirect('/auth/login')
  }
  const { low, medium, high
  } = await api.tasks.getByPriority({ token })

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Pending Tasks */}
      <div className="shadow-md rounded-lg">
        <h2 className="text-md  font-semibold rounded-md text-gray-700 uppercase p-2 mb-4">
          Low
        </h2>
        <div className="space-y-3">
          {low.length === 0 ? (
            <p className="text-gray-500 text-sm">No Low Priority Task</p>
          ) : (
            low.map((task) => (
              <div
                key={task._id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                <h3 className="mb-2">{task.title}</h3>
                <p className="ml-1 text-sm text-gray-600 mb-3">{task.description || "No Description"}</p>
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
            ))
          )}
        </div>
      </div>

      {/* In-Progress Tasks */}
      <div className="shadow-md rounded-lg ">
        <h2 className="text-md  font-semibold rounded-md text-gray-700 capitalize  p-2 mb-4">
          Medium
        </h2>
        <div className="space-y-3">
          {medium.length === 0 ? (
            <p className="text-gray-500 text-sm">No Medium Priority Task</p>
          ) : (
            medium.map((task) => (
              <div
                key={task._id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                <h3 className="mb-2">{task.title}</h3>
                <p className="ml-1 text-sm text-gray-600 mb-3">{task.description || "No Description"}</p>
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
            ))
          )}
        </div>
      </div>

      {/* Completed Tasks */}
      <div className="shadow-md rounded-lg p-1">
        <h2 className="text-md  font-semibold rounded-md text-gray-700 capitalize  p-2 mb-4">
          High
        </h2>
        <div className="space-y-3">
          {high.length === 0 ? (
            <p className="text-gray-500 text-sm">No High Priority Task
            </p>
          ) : (
            high.map((task) => (
              <div
                key={task._id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                <h3 className="mb-2">{task.title}</h3>
                <p className="ml-1 text-sm text-gray-600 mb-3">{task.description || "No Description"}</p>
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
            ))
          )}
        </div>
      </div>
    </div>)
}
