import { api, Task } from "@/utils/api";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";

const priorities = ["low", "medium", "high"] as const;

export default async function ShowByPriorityPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    redirect("/auth/login");
  }

  const data = await api.tasks.getByPriority({ token });

  const getColorClasses = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
      {priorities.map((priority) => (
        <div key={priority} className="shadow-md rounded-lg">
          <h2 className="text-md font-semibold text-gray-700 uppercase p-2 mb-4">
            {priority}
          </h2>
          <div className="space-y-3">
            {data[priority].length === 0 ? (
              <p className="text-gray-500 text-sm">
                No {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority Task
              </p>
            ) : (
              data[priority].map((task: Task) => (

                <Link
                  href={`/tasks/${task._id}`}
                  key={task._id}
                >
                  <div
                    className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <h3 className="mb-2">{task.title}</h3>
                    <p className="ml-1 text-sm text-gray-600 mb-3">
                      {task.description || "No Description"}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getColorClasses(
                        task.priority
                      )}`}
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
        </div>
      ))}
    </div>
  );
}

