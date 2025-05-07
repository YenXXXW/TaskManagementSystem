'use client'

import React, { useState } from 'react';
import { Task } from '@/utils/api'; // Assuming your interface is in types.ts
import { format } from 'date-fns';
import { ClockIcon, FlagIcon, UserIcon, IdentificationIcon, PencilSquareIcon } from '@heroicons/react/24/outline'; // Added PencilSquareIcon

interface TaskDetailProps {
  task: Task;
  onEdit: (updatedTask: Partial<Task>) => void; // Placeholder for your edit function
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTask, setEditableTask] = useState<Partial<Task>>(task);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  const priorityColorClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-700 ring-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 ring-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-700 ring-red-300';
      default:
        return 'bg-gray-100 text-gray-700 ring-gray-300';
    }
  };

  const statusColorClass = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-200 text-gray-800 ring-gray-400';
      case 'in-progress':
        return 'bg-blue-200 text-blue-800 ring-blue-400';
      case 'completed':
        return 'bg-purple-200 text-purple-800 ring-purple-400';
      default:
        return 'bg-gray-200 text-gray-800 ring-gray-400';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditableTask({ ...editableTask, [name]: value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    onEdit(editableTask);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setEditableTask(task);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="px-6 py-4 relative">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editableTask.title || ''}
              onChange={handleInputChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          ) : (
            task.title
          )}
        </h2>
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-4 text-gray-500 hover:text-indigo-600 focus:outline-none"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        {isEditing ? (
          <textarea
            name="description"
            value={editableTask.description || ''}
            onChange={handleInputChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mb-5"
          />
        ) : (
          <p className="text-gray-700 leading-relaxed mb-5">{task.description}</p>
        )}

        <div className="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-x-6 mb-4">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Due Date:</span>
            {isEditing ? (
              <input
                type="date"
                name="dueDate"
                value={editableTask.dueDate ? formatDate(editableTask.dueDate).split(',')[0] : ''} // Basic date input
                onChange={handleInputChange}
                className="text-sm font-semibold text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            ) : (
              <span className={`text-sm font-semibold ${task.isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                {formatDate(task.dueDate)} {task.isOverdue && <span className="italic text-xs">(Overdue)</span>}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <FlagIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Priority:</span>
            {isEditing ? (
              <select
                name="priority"
                value={editableTask.priority || 'medium'}
                onChange={handleInputChange}
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${priorityColorClass(editableTask.priority || 'medium')}`}
              >
                <option value="low" className={priorityColorClass('low')}>Low</option>
                <option value="medium" className={priorityColorClass('medium')}>Medium</option>
                <option value="high" className={priorityColorClass('high')}>High</option>
              </select>
            ) : (
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${priorityColorClass(task.priority)}`}>
                {task.priority}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <span className={`h-5 w-5 text-green-500`}>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-2.716a.75.75 0 00-1.224.872l2.54 3.46a.75.75 0 001.133-.893l3.076-4.189z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-600">Status:</span>
            {isEditing ? (
              <select
                name="status"
                value={editableTask.status || 'pending'}
                onChange={handleInputChange}
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${statusColorClass(editableTask.status || 'pending')}`}
              >
                <option value="pending" className={statusColorClass('pending')}>Pending</option>
                <option value="in-progress" className={statusColorClass('in-progress')}>In Progress</option>
                <option value="completed" className={statusColorClass('completed')}>Completed</option>
              </select>
            ) : (
              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${statusColorClass(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
            )}
          </div>

          {task.assignedTo && (
            <div className="flex items-center space-x-3">
              <UserIcon className="h-5 w-5 text-indigo-500" />
              <span className="text-sm font-medium text-gray-600">Assigned To:</span>
              <span className="text-sm text-gray-800">{task.assignedTo.name}</span>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-teal-500" />
            <span className="text-sm font-medium text-gray-600">Created By:</span>
            <span className="text-sm text-gray-800">{task.createdBy.name}</span>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <IdentificationIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">Task ID:</span>
            </div>
            <span className="text-sm text-gray-800 ml-8">{task._id}</span>
          </div>
        </div>

        {(isEditing) && (
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={handleCancelClick}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClick}
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;
