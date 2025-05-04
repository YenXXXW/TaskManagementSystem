import { Notification } from "@/utils/api";
import { UserIcon } from '@heroicons/react/24/solid';

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
    <div className="p-4 bg-white hover:bg-gray-50 transition rounded-md shadow-sm cursor-pointer space-y-1">
      <div className="flex items-center text-sm text-gray-800 space-x-2">
        <UserIcon className="w-9 h-9 bg-gray-100 py-1 rounded-full text-gray-500" />
        <div>
          <p>
            <span className="font-semibold ">{notifiation.createdBy.name}&nbsp;</span>
            <span>{getMessage(notifiation.type)}</span>
          </p>
          <p className="text-blue-600 underline text-sm">{notifiation.task?.title}</p>
        </div>
      </div>
    </div>
  );
}

export default NotiCard;
