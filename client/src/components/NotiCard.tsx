import { Notification } from "@/utils/api";
import { UserIcon } from '@heroicons/react/24/solid';
import Link from "next/link";


function NotiCard({ notifiation }: { notifiation: Notification }) {
  const getMessage = (type: string) => {
    switch (type) {
      case "taskAssigned":
        return "assigned you a task";
      case "taskUpdated":
        return "updated a task";
      default:
        return "";
    }
  };

  return (
    <Link href={`/tasks/${notifiation.task?._id}`}>
      <div className="p-4  hover:bg-gray-50 transition rounded-md shadow-sm cursor-pointer space-y-1">
        <div className="flex items-center text-sm text-gray-800 space-x-2">
          <UserIcon className="w-9 h-9 bg-gray-100 py-1 rounded-full text-gray-500" />
          <div>
            <p>
              <span className="font-semibold ">{notifiation.createdBy.name}&nbsp;</span>
              <span>{getMessage(notifiation.type)}</span>
            </p>
            <p className={`${notifiation.task?.title ? "text-blue-600" : "text-red-500"} underline text-sm`}>{notifiation.task?.title || "task is deleted"}</p>
          </div>
        </div>
      </div>

    </Link>
  );
}

export default NotiCard;
