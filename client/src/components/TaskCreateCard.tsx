import { CreateTaskData, Task, User } from "@/utils/api";
import React, { useEffect, useRef, useState } from "react";
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';


interface newTask {
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo: string;

}

interface TaskCreateCardProps {
  task: CreateTaskData
  users: User[]
  setNewTask: React.Dispatch<React.SetStateAction<CreateTaskData>>
  handleCreateTask: () => Promise<void>
  hideTaskCreateModal: () => void
}

export default function TaskCreateCard({ task, users, setNewTask, handleCreateTask, hideTaskCreateModal }: TaskCreateCardProps) {

  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPrority] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [editingAssignee, setEditingAssignee] = useState(false)

  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const titleRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editingDueDate && dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.focus();
    }
  }, [editingDueDate]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, [])

  const handleTitleChagne = (title: string) => {
    setNewTask({ ...task, title })

  }

  const handleDescriptionChange = (desc: string) => {
    setNewTask({ ...task, description: desc })
  }

  const handleStatusChange = (status: "pending" | "in-progress" | "completed") => {

    const updatedTask = {
      ...task,
      status
    }
    setNewTask(updatedTask)
    setEditingStatus(false);
  };


  const handlePriorityChange = (priority: "low" | "medium" | "high") => {
    const updatedTask = {
      ...task,
      priority
    }
    setNewTask(updatedTask)
    setEditingPrority(false);
  };


  const handleAssingeeChange = (assignedTo: User) => {
    setNewTask(prev => ({ ...prev, assignedTo: assignedTo._id }));
    setEditingAssignee(false)
  };

  const handleDueDateChange = (newDate: string) => {
    setNewTask((prev) => ({ ...prev, dueDate: newDate }));
    setEditingDueDate(false);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };


  return (
    <div className='flex group gap-3 items-center'>

      <input
        type="checkbox" className=" z-10 opacity-0  transition-opacity"
      />

      <div className="p-4 shadow rounded-lg hover:shadow-lg transition-shadow grid grid-cols-[2fr_2fr_1fr_1fr_1fr_2fr] w-full litems-center gap-4 duration-200">
        {/* Title + Actions */}
        <div className="flex items-center space-x-2">

          <input
            ref={titleRef}
            className="text-sm font-medium text-gray-900 focus:outline-none"
            type={"string"}
            value={task.title}
            placeholder="Enter title"
            onChange={(e) => handleTitleChagne(e.target.value)}
          />

        </div>

        {/* Description */}

        <input
          className="text-sm font-medium text-gray-900 focus:outline-none"
          type={"string"}
          value={task.description}
          placeholder="Enter description"
          onChange={(e) => handleDescriptionChange(e.target.value)}
        />

        {/* Tags */}
        <div className="relative flex text-sm font-semibold  space-x-2">
          {editingStatus && (
            <div className="absolute z-50 bg-white top-full text-gray-800 rounded-md shadow-lg mt-1 w-full">
              <div
                onClick={() => handleStatusChange('pending')}
                className={`px-4 py-2 cursor-pointer `}
              >
                <span className={`mr-2 inline-block w-2 h-2 ${getStatusColor('pending')} rounded-full`}></span>
                Pending
              </div>
              <div
                onClick={() => handleStatusChange('in-progress')}
                className={`px-4 py-2 cursor-pointer text-nowrap `}
              >
                <span className={`mr-2 inline-block w-2 h-2 ${getStatusColor('in-progress')} rounded-full`}></span>
                In Progress
              </div>
              <div
                onClick={() => handleStatusChange('completed')}
                className={`px-4 py-2 cursor-pointer `}
              >

                <span className={`mr-2 inline-block w-2 h-2 ${getStatusColor('completed')} rounded-full`}></span>
                Done
              </div>
            </div>
          )}
          <span
            onClick={() => setEditingStatus(true)}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(task.status)} hover:bg-gray-200 transition duration-300`}
            title="Click to change status"
          >
            {task.status}
          </span>

        </div>
        <div className="relative flex text-sm font-semibold  space-x-2">

          {editingPriority && (
            <div className="absolute z-50 bg-white top-full text-gray-800 rounded-md shadow-lg mt-1 w-full">
              <div
                onClick={() => handlePriorityChange('low')}
                className={`px-4 py-2 cursor-pointer `}
              >
                <span className={`mr-2 inline-block w-2 h-2 ${getPriorityColor('low')} rounded-full`}></span>
                Low
              </div>
              <div
                onClick={() => handlePriorityChange('medium')}
                className={`px-4 py-2 cursor-pointer text-nowrap `}
              >
                <span className={`mr-2 inline-block w-2 h-2 ${getPriorityColor('medium')} rounded-full`}></span>
                Meidum
              </div>
              <div
                onClick={() => handlePriorityChange('high')}
                className={`px-4 py-2 cursor-pointer `}
              >

                <span className={`mr-2 inline-block w-2 h-2 ${getPriorityColor('high')} rounded-full`}></span>
                High
              </div>
            </div>
          )}
          <span
            onClick={() => setEditingPrority(true)}
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        {/* Due Date */}
        <div className="relative flex text-sm font-semibold space-x-2">
          {editingDueDate && (
            <input
              ref={dateInputRef}
              type="date"
              value={task.dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              onBlur={() => setEditingDueDate(false)}
              className="absolute top-full mt-1 px-2 py-1 rounded-md border border-gray-300 shadow-md text-sm z-50"
              autoFocus
            />
          )}
          <span
            onClick={() => setEditingDueDate(true)}
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition"
          >
            {new Date(task.dueDate).toLocaleDateString() || "Set due date"}
          </span>

        </div>

        {/* Assignee */}
        <div className="flex relative justify-between items-center text-sm text-gray-500">
          {
            editingAssignee && (
              <div className='absolute z-50 bg-white top-full text-gray-800 rounded-md shadow-lg mt-1 w-full'>

                {
                  users.map(user => (
                    <span
                      key={user._id}
                      onClick={() => handleAssingeeChange(user)}
                      className='my-2 block hover:bg-green-50'
                    >
                      {user.name}
                    </span>
                  ))
                }
              </div>

            )
          }
          <div className="flex cursor-pointer"
            onClick={() => setEditingAssignee(true)}
          >
            <svg
              className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {users.find(user => user._id === task.assignedTo)?.name || 'Unassigned'}
          </div>

          <div className="flex gap-3">
            <button className="h-5 w-5 p-1 bg-green-500 rounded-full hover:bg-green-300"
              onClick={handleCreateTask}
            >

              <CheckIcon className="text-white text-sm" />
            </button>

            <button className="h-5 w-5 p-1 bg-red-500 rounded-full hover:bg-red-300"
              onClick={hideTaskCreateModal}
            >
              <XMarkIcon className="text-white text-sm" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
} 
