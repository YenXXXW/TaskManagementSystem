import { Task, User } from "@/utils/api";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, XMarkIcon, ArrowTurnUpRightIcon } from '@heroicons/react/24/solid';
import Link from "next/link";
import { useAppSelector } from "@/state/hooks";

export function TaskCard({ task, users, handleUpdateTask, setSelectedTasks, selectedTasks }: {
  task: Task;
  users: User[]
  handleUpdateTask: (task: Task) => Promise<void>
  selectedTasks: string[]
  setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>
}
) {

  const assigneeRef = useRef<HTMLDivElement | null>(null)
  const priorityRef = useRef<HTMLDivElement | null>(null)
  const statusRef = useRef<HTMLDivElement | null>(null)
  const [originalTask, setOriginalTask] = useState(task)

  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPrority] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [editedTask, setEditedTask] = useState(task);
  const [editingAssignee, setEditingAssignee] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)


  const currentUser = useAppSelector(state => state.user.user)

  useEffect(() => {
    setEditedTask(task)
    setOriginalTask(task)
  }, [task])
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (assigneeRef.current && !assigneeRef.current.contains(event.target as Node)) {
        setEditingAssignee(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target as Node)) {
        setEditingPrority(false)
      }

      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setEditingStatus(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    if (editingDueDate && dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.focus();
    }
  }, [editingDueDate]);

  const updateTask = async (updatedTask: Task) => {
    try {
      await handleUpdateTask(updatedTask)
      setOriginalTask(updatedTask)

    } catch (error) {
      console.log("error updating taks", error)
      setEditedTask(originalTask)

    }

  }

  const handleStatusChange = async (status: "pending" | "in-progress" | "completed") => {

    console.log("hello")
    const updatedTask = {
      ...editedTask,
      status
    }
    setEditedTask(updatedTask)
    setEditingStatus(false);
    try {

      await updateTask(updatedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }

  };


  const handlePriorityChange = async (priority: "low" | "medium" | "high") => {
    const updatedTask = {
      ...editedTask,
      priority
    }
    console.log("updated tAsk", updatedTask)
    setEditedTask(updatedTask)
    setEditingPrority(false);

    try {
      await updateTask(updatedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }
  };


  const handleAssingeeChange = async (assignedTo: User) => {
    const updatedTask = {
      ...editedTask,
      assignedTo
    }
    setEditedTask(updatedTask);
    setEditingAssignee(false)

    try {
      await updateTask(updatedTask)
    } catch (err) {
      console.log("error upading assigne", err)
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    const updatedTask = {
      ...editedTask,
      dueDate: newDate
    }
    setEditedTask(updatedTask);
    setEditingDueDate(false);

    try {
      await updateTask(updatedTask)
    } catch (err) {
      console.log("error upading assigne", err)
    }
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

  const handleDescriptionChange = (description: string) => {
    setEditingDesc(true)
    setEditedTask(prev => ({ ...prev, description }))
  }

  const handleTitleChange = async (title: string) => {
    setEditingTitle(true)
    const updatedTask = {
      ...editedTask,
      title
    }
    setEditedTask(updatedTask)
  }

  const UpdateTitle = async () => {
    try {
      await updateTask(editedTask)
      setEditingTitle(false)
    } catch (err) {
      console.log("error udating taks", err)
    }
  }

  const UpdateDesc = async () => {
    try {
      await updateTask(editedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }
    setEditingDesc(false)
  }


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

  const toggleTaskSelect = () => {
    if (currentUser && currentUser._id === task.createdBy._id)
      if (selectedTasks.includes(task._id)) {
        const updated = selectedTasks.filter(t => t !== task._id)
        setSelectedTasks([...updated])
      } else {
        setSelectedTasks([...selectedTasks, task._id])
      }
  }

  return (
    <div className="relative group flex gap-3 " >


      <input
        type="checkbox"
        checked={selectedTasks.includes(task._id)}
        onChange={toggleTaskSelect}
        className={` ${selectedTasks.includes(task._id) && "opacity-100"} z-10 opacity-0 group-hover:opacity-100 transition-opacity ${task.createdBy._id !== currentUser?._id ? 'cursor-not-allowed' : 'cursor-pointer'} `}
      />

      <div className="p-4 shadow rounded-lg hover:shadow-lg transition-shadow grid grid-cols-[2fr_2fr_1fr_1fr_1fr_2fr] w-full litems-center gap-4 duration-200">
        <div className='relative '>
          <input
            value={editedTask.title}
            placeholder='Enter Title'
            onChange={(e) => {
              e.stopPropagation()
              handleTitleChange(e.target.value)
            }}
            className="text-sm w-full text-gray-500 focus:outline-none focus:bg-white/80"
          />
          {
            editingTitle && (
              <div className='absolute right-0'>
                <div className='flex gap-2'>
                  <button
                    onClick={UpdateTitle}
                  >
                    <CheckIcon className='bg-white w-5 h-5' />
                  </button>
                  <button onClick={() => {
                    setEditedTask({
                      ...task,
                      title: originalTask.title
                    })
                    setEditingTitle(false)
                  }}>
                    <XMarkIcon className='bg-white w-6 h-5' />
                  </button>
                </div>

              </div>)
          }
        </div>

        {/* Description */}
        <div className='relative'>
          <input
            value={editedTask.description}
            placeholder='Enter description'
            onChange={(e) => {
              e.preventDefault()
              handleDescriptionChange(e.target.value)
            }
            }

            className="text-sm w-full text-gray-500 focus:outline-none focus:bg-white/80"
          />
          {
            editingDesc && (
              <div className='absolute right-0'>
                <div className='flex gap-2'>
                  <button
                    onClick={UpdateDesc}
                  >
                    <CheckIcon className='bg-white w-5 h-5' />
                  </button>
                  <button onClick={() => {
                    setEditedTask({
                      ...task,
                      description: originalTask.description
                    })
                    setEditingDesc(false)
                  }}>
                    <XMarkIcon className='bg-white w-6 h-5' />
                  </button>
                </div>

              </div>)
          }
        </div>

        {/* Tags */}
        <div
          ref={statusRef}
          className="relative flex text-sm font-semibold  space-x-2">
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
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(editedTask.status)} hover:bg-gray-200 transition duration-300`}
            title="Click to change status"
          >
            {editedTask.status}
          </span>

        </div>
        <div className="relative cursor-pointer flex text-sm font-semibold  space-x-2">

          {editingPriority && (
            <div
              ref={priorityRef}
              className="absolute z-50 bg-white top-full text-gray-800 rounded-md shadow-lg mt-1 w-full">
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
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(editedTask.priority)}`}>
            {editedTask.priority}
          </span>
        </div>

        {/* Due Date */}
        <div className="relative flex text-sm font-semibold space-x-2">
          {editingDueDate && (
            <input
              ref={dateInputRef}
              type="date"
              value={editedTask.dueDate ? editedTask.dueDate.slice(0, 10) : ''}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                handleDueDateChange(e.target.value)
              }}
              onBlur={() => setEditingDueDate(false)}
              className="absolute top-full mt-1 px-2 py-1 rounded-md border border-gray-300 shadow-md text-sm z-50"
              autoFocus
            />
          )}
          <span
            onClick={() => setEditingDueDate(true)}
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition"
          >
            {new Date(editedTask.dueDate).toLocaleDateString() || "Set due date"}
          </span>

        </div>

        {/* Assignee */}
        <div className="flex justify-between">
          <div
            ref={assigneeRef}
            onClick={() => setEditingAssignee(true)}
            className="flex cursor-pointer relative items-center text-sm text-gray-500">
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
            <svg
              className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {editedTask.assignedTo?.name || 'Unassigned'}
          </div>

          <Link href={`tasks/${editedTask._id}`}>
            <ArrowTurnUpRightIcon className="w-6 h-6 text-green-500" />
          </Link>
        </div>


      </div>
    </div >
  );
} 
