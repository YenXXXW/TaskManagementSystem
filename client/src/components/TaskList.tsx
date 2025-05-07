'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { api, Task, User, UpdateTaskData, CreateTaskData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import TaskCreateCard from './TaskCreateCard';
import { addTask, refechTask } from '@/state/taskSlice';
import { format } from 'date-fns'
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[]
}

export default function TaskList({
  tasks
}: TaskListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverDueTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'overdue'>('assigned');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [nearDeadlineTasks, setNearDeadlineTasks] = useState<Task[]>([])
  const [AllTasksSelected, setAllTasksSelected] = useState(false)
  const router = useRouter();
  const user = useAppSelector(state => state.user.user)


  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toString(),
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
  });

  let token: string | null
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }

  const fectchNearDealineTasks = async () => {
    const res = await api.tasks.getNearDeathlineTasks()
    setNearDeadlineTasks(res)
  }

  useEffect(() => {

    fectchNearDealineTasks()
  }, [])

  const dispatch = useAppDispatch()
  useEffect(() => {

    dispatch(addTask(tasks))
  }, [])

  const tasksFromSlice = useAppSelector(state => state.task.tasks)

  useEffect(() => {
    fetchUsers();
  }, []);


  useEffect(() => {
    if (tasksFromSlice.length && user) {
      console.log("from task Slice", tasksFromSlice)
      const assigned = tasksFromSlice.filter(task => (task.assignedTo?._id === user._id));
      const created = tasksFromSlice.filter(task => (task.createdBy._id === user._id));
      const overdueTasks = tasksFromSlice.filter(task => (task.isOverdue));
      setOverDueTasks(overdueTasks)
      setAssignedTasks(assigned)
      setCreatedTasks(created)
    }
  }, [tasksFromSlice])

  const getTasksCount = (statusType: string) => {
    if (activeTab === "created") {
      return createdTasks.filter(t => t.status === statusType).length

    } else if (activeTab === "assigned") {

      return assignedTasks.filter(t => t.status === statusType).length
    } else if (activeTab === 'overdue') {
      return overdueTasks.filter(t => t.status === statusType).length
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      if (!token) {
        return
      }
      setLoading(true);
      const data = await api.tasks.getAll(token);
      dispatch(refechTask(data))
      setError(null);
    } catch (error) {
      setError('Failed to fetch tasks');
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      await api.tasks.create(newTask);
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
      });
      fetchTasks();
    } catch (error) {
      setError('Failed to create task');
      console.error('Failed to create task:', error);
    }
  };

  const handleSelectAllTasks = () => {
    if (AllTasksSelected) {
      setAllTasksSelected(false)
      setSelectedTasks([])
    } else {

      setAllTasksSelected(!AllTasksSelected)
      const userCreatedTasks = tasks.filter(t => t.createdBy._id === user?._id).map(t => t._id)
      setSelectedTasks([...userCreatedTasks])
    }
  }

  const handleUpdateTask = async (editTask: Task) => {
    if (!user) return
    console.log("editTask", editTask)
    const { _id, ...updatedTask } = editTask

    try {
      const res = await api.tasks.update(_id, {
        updatedBy: user._id,
        ...updatedTask,
        assignedTo: updatedTask?.assignedTo?._id || ''
      } as UpdateTaskData);
      console.log("updatee res", res)
      setShowEditModal(false);
      await fetchTasks();
    } catch (error) {
      setError('Failed to update task');
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTasks = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    if (selectedTasks.length > 0) {

      try {
        await api.tasks.delete({ ids: selectedTasks });
        await fetchTasks();
      } catch (error) {
        setError('Failed to delete task');
        console.error('Failed to delete task:', error);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 ">
        {/* Header Section */}


        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your tasks and track progress
            </p>
          </div>
        </div>
        <div className='my-10 '>
          {
            nearDeadlineTasks.length > 0 && (
              <div className="">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Near Deadline Tasks</h2>
                <ul className="space-x-10 flex overflow-auto">
                  {nearDeadlineTasks.map((task) => (
                    <li key={task._id} className="bg-red-100 rounded-md p-3 border border-red-500 transition duration-150 ease-in-out">
                      <div className="flex justify-between gap-5 items-center">
                        <div className='flex flex-col gap-3'>
                          <h3 className="text-md font-medium text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600">Due on: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>)
          }
        </div>
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 items-center">
            <button
              onClick={() => setActiveTab('assigned')}
              className={`${activeTab === 'assigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Tasks
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {assignedTasks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('created')}
              className={`${activeTab === 'created'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Created Tasks
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {createdTasks.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('overdue')}
              className={`${activeTab === 'overdue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              OverDue Tasks
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {overdueTasks.length}
              </span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-10 inline-flex items-center px-2 border-gray-600  text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Task
            </button>

            {selectedTasks.length > 0 &&

              <button
                onClick={handleDeleteTasks}
                className="h-10 inline-flex items-center px-2 border-gray-600  text-sm font-medium rounded-md text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Delete Task
              </button>
            }
          </nav>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd className="text-lg font-semibold text-gray-900">{activeTab === "created" ? createdTasks.length : assignedTasks.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {getTasksCount("completed")}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {getTasksCount("in-progress")}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {getTasksCount("pending")}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="">
          {
            (tasks.length > 0) &&
            <div className='flex group'>

              <input
                onChange={handleSelectAllTasks}
                type="checkbox"
                className={`${AllTasksSelected && 'opacity-100'} z-10 opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="p-4 grid grid-cols-[200px_200px_120px_120px_120px_120px] items-center gap-4 font-semibold ">
                <div>Title</div>
                <div>Description</div>
                <div>Status</div>
                <div>Priority</div>
                <div>Due Date</div>
                <div>Assignee</div>
              </div>
            </div>
          }
          {showCreateModal &&
            <TaskCreateCard
              users={users}
              task={newTask}
              setNewTask={setNewTask}
              handleCreateTask={handleCreateTask}
              hideTaskCreateModal={() => setShowCreateModal(false)}
            />
          }
          {(activeTab === 'assigned' ? assignedTasks : activeTab === 'created' ? createdTasks : overdueTasks).map((task, i) => (
            <TaskCard
              selectedTasks={selectedTasks}
              setSelectedTasks={setSelectedTasks}
              users={users}
              key={i}
              task={task}
              handleUpdateTask={handleUpdateTask}
            />

          ))}
        </div>

        {/* Empty State */}
        {(activeTab === 'assigned' ? assignedTasks : createdTasks).length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === 'assigned'
                ? 'You have no tasks assigned to you.'
                : 'You have not created any tasks yet.'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Updated TaskCard component
function TaskCard({ task, users, handleUpdateTask, setSelectedTasks, selectedTasks }: {
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

  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPrority] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [editedTask, setEditedTask] = useState(task);
  const [editingAssignee, setEditingAssignee] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)


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

  const handleStatusChange = async (status: "pending" | "in-progress" | "completed") => {

    const updatedTask = {
      ...editedTask,
      status
    }
    setEditedTask(updatedTask)
    setEditingStatus(false);
    try {
      await handleUpdateTask(updatedTask)
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
      await handleUpdateTask(updatedTask)
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
      await handleUpdateTask(updatedTask)
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
      await handleUpdateTask(updatedTask)
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
      await handleUpdateTask(editedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }
  }

  const UpdateDesc = async () => {
    try {
      await handleUpdateTask(editedTask)
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
    console.log("h")
    if (selectedTasks.includes(task._id)) {
      const updated = selectedTasks.filter(t => t !== task._id)
      setSelectedTasks([...updated])
    } else {
      setSelectedTasks([...selectedTasks, task._id])
    }
  }

  return (
    <div className=" group flex gap-3">
      <input
        type="checkbox"
        checked={selectedTasks.includes(task._id)}
        onChange={toggleTaskSelect}
        className={`${selectedTasks.includes(task._id) && "opacity-100"} z-10 opacity-0 group-hover:opacity-100 transition-opacity`}
      />
      <div className="p-4 shadow rounded-lg hover:shadow-lg transition-shadow grid grid-cols-[200px_200px_120px_120px_120px_120px] items-center gap-4 duration-200">
        {/* Title + Actions */}
        <div className='relative '>
          <input
            value={editedTask.title}
            placeholder='Enter description'
            onChange={(e) => handleTitleChange(e.target.value)}
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
                  <button onClick={() => setEditingTitle(false)}>
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
            onChange={(e) => handleDescriptionChange(e.target.value)}
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
                  <button onClick={() => setEditingDesc(false)}>
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
              value={editedTask.dueDate}
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


      </div>
    </div>
  );
} 
