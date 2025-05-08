'use client'

import React, { useEffect, useRef, useState } from 'react';
import { api, Task, UpdateTaskData, User } from '@/utils/api';
import { format } from 'date-fns';
import { ClockIcon, FlagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '@/state/hooks';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface TaskDetailProps {
  task: Task;
  onEdit: (updatedTask: Partial<Task>) => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onEdit }) => {
  const [editableTask, setEditableTask] = useState<Task>(task);
  const [editingAssignee, setEditingAssignee] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  const [originalTask, setOriginalTask] = useState<Task>(task)
  const assigneeRef = useRef<HTMLDivElement | null>(null)

  const getUsers = async () => {
    try {
      const res = await api.users.getAll()
      setUsers(res)
    } catch (err) {
      console.log("Error fetching users")
    }

  }

  useEffect(() => {
    getUsers()
  }, [])

  useEffect(() => {
    setEditableTask(task)
    setOriginalTask(task)
  }, [task])

  const user = useAppSelector(state => state.user.user)

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


  const handleUpdateTask = async (editTask: Task) => {
    if (!user) return
    console.log("editTask", editTask)
    const { _id, ...updatedTask } = editTask

    try {
      await api.tasks.update(_id, {
        updatedBy: user._id,
        ...updatedTask,
        assignedTo: updatedTask?.assignedTo?._id || ''
      } as UpdateTaskData);

      setOriginalTask(editTask)
    } catch (error) {
      setEditableTask(originalTask)
      console.error('Failed to update task:', error);
    }
  };

  const handleStatusChange = async (status: "pending" | "in-progress" | "completed") => {

    const updatedTask = {
      ...editableTask,
      status
    }
    setEditableTask(updatedTask)
    try {
      await handleUpdateTask(updatedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }

  };


  const handlePriorityChange = async (priority: "low" | "medium" | "high") => {
    const updatedTask = {
      ...editableTask,
      priority
    }
    console.log("updated tAsk", updatedTask)
    setEditableTask(updatedTask)

    try {
      await handleUpdateTask(updatedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }
  };


  const handleAssingeeChange = async (assignedTo: User) => {
    const updatedTask = {
      ...editableTask,
      assignedTo
    }
    setEditableTask(updatedTask);
    setEditingAssignee(false)

    try {
      await handleUpdateTask(updatedTask)
    } catch (err) {
      console.log("error upading assigne", err)
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    const updatedTask = {
      ...editableTask,
      dueDate: newDate
    }
    setEditableTask(updatedTask);

    try {
      await handleUpdateTask(updatedTask)
    } catch (err) {
      console.log("error upading assigne", err)
    }
  };

  const handleDescriptionChange = (description: string) => {
    setEditingDesc(true)
    setEditableTask(prev => ({ ...prev, description }))
  }

  const handleTitleChange = async (title: string) => {
    setEditingTitle(true)
    const updatedTask = {
      ...editableTask,
      title
    }
    setEditableTask(updatedTask)
  }

  const UpdateTitle = async () => {
    try {
      await handleUpdateTask(editableTask)
      setEditingTitle(false)
    } catch (err) {
      console.log("error udating taks", err)
    }
  }

  const UpdateDesc = async () => {
    try {
      await handleUpdateTask(editableTask)
      setEditingDesc(false)
    } catch (err) {
      console.log("error udating taks", err)
    }
    setEditingDesc(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setEditingAssignee(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-xl p-10">
      <div>

        <h2 className="text-2xl relative max-w-[400px] font-bold text-gray-900 mb-3">
          <input
            type="text"
            name="title"
            value={editableTask.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full p-2 my-5 text-md lg:text-xl border-gray-300 rounded-md focus:outline-none"
          />

          {
            editingTitle && (
              <div className='absolute right-0 z-20'>
                <div className='flex gap-2'>
                  <button
                    onClick={UpdateTitle}
                  >
                    <CheckIcon className='bg-white  shadow w-5 h-5' />
                  </button>
                  <button onClick={() => {
                    setEditableTask(originalTask)
                    setEditingTitle(false)
                  }}>
                    <XMarkIcon className='bg-white  shadow w-6 h-5' />
                  </button>
                </div>

              </div>)
          }
        </h2>
        <div className='relative'>
          <textarea
            placeholder="Enter description"
            rows={5}
            name="description"
            value={editableTask.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full border p-2 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none sm:text-sm mb-5"
          />

          {
            editingDesc && (
              <div className='absolute right-0'>
                <div className='flex gap-2'>
                  <button
                    onClick={UpdateDesc}
                  >
                    <CheckIcon className='bg-white shadow w-5 h-5' />
                  </button>

                  <button onClick={() => {
                    setEditableTask(originalTask)
                    setEditingTitle(false)
                  }}>
                    <XMarkIcon className='bg-white shadow w-6 h-5' />
                  </button>
                </div>

              </div>)
          }
        </div>

        <div className="grid grid-cols-1 gap-y-4  md:gap-x-6 mb-4">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Due Date:</span>
            <input
              type="date"
              name="dueDate"
              value={editableTask.dueDate ? editableTask.dueDate.slice(0, 10) : ''}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="text-sm font-semibold text-gray-800 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center space-x-3">
            <FlagIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600">Priority:</span>
            <select
              name="priority"
              value={editableTask.priority || 'medium'}
              onChange={(e) => handlePriorityChange(e.target.value as "low" | "medium" | "high")}
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${priorityColorClass(task.priority || 'medium')}`}
            >
              <option value="low" className={priorityColorClass('low')}>Low</option>
              <option value="medium" className={priorityColorClass('medium')}>Medium</option>
              <option value="high" className={priorityColorClass('high')}>High</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`h-5 w-5 text-green-500`}>
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-2.716a.75.75 0 00-1.224.872l2.54 3.46a.75.75 0 001.133-.893l3.076-4.189z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <select
              name="status"
              value={editableTask.status || 'pending'}
              onChange={(e) => handleStatusChange(e.target.value as "pending" | "in-progress" | "completed")}
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${statusColorClass(task.status || 'pending')}`}
            >
              <option value="pending" className={statusColorClass('pending')}>Pending</option>
              <option value="in-progress" className={statusColorClass('in-progress')}>In Progress</option>
              <option value="completed" className={statusColorClass('completed')}>Completed</option>
            </select>
          </div>


          {/* Assignee */}
          <div
            ref={assigneeRef}
            onClick={() => setEditingAssignee(true)}
            className="flex cursor-pointer space-x-3 relative items-center  text-gray-500">
            <UserIcon className="h-5 w-5 text-teal-500" />
            <span className="text-sm  font-medium text-gray-600">Assigned To:

            </span>
            <span className="text-sm relative text-gray-800">{editableTask.assignedTo?.name || "Unassigned"}

              {
                editingAssignee && (
                  <div className='absolute z-50 top-full right-0 w-[150px] text-gray-800 rounded-md shadow-lg mt-1 p-3 bg-gray-100'>

                    {
                      users.map(user => (
                        <span
                          key={user._id}
                          onClick={() => handleAssingeeChange(user)}
                          className='p-2 block hover:bg-white rounded-sm'
                        >
                          {user.name}
                        </span>
                      ))
                    }
                  </div>

                )
              }
            </span>

          </div>


          <div className="flex items-center space-x-3">
            <UserIcon className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-gray-600">Created By:</span>
            <span className="text-sm text-gray-800">{task.createdBy.name}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
