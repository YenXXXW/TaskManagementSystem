'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api, Task, User, UpdateTaskData, CreateTaskData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/state/hooks';
import TaskCreateCard from './TaskCreateCard';
import { refechTask } from '@/state/taskSlice';
import { TaskCard } from './TaskCard';

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
  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'overdue'>('created');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
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

  const dispatch = useAppDispatch()

  const tasksFromSlice = useAppSelector(state => state.task.tasks)

  useEffect(() => {
    fetchUsers();
  }, []);


  useEffect(() => {
    if (tasksFromSlice && user) {
      const assigned = tasksFromSlice.filter(task => (task.assignedTo?._id === user._id));
      const created = tasksFromSlice.filter(task => (task.createdBy._id === user._id));
      const overdueTasks = tasksFromSlice.filter(task => (task.isOverdue));
      setOverDueTasks([...overdueTasks])
      setAssignedTasks([...assigned])
      setCreatedTasks([...created])
    }
  }, [tasksFromSlice])

  useEffect(() => {


    console.log(assignedTasks)
  }, [assignedTasks])


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
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toString(),
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
    <div className="min-h-screen">
      <div className=" mx-auto px-4 ">
        {/* Header Section */}


        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your tasks and track progress
            </p>
          </div>
        </div>
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 items-center">
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
              onClick={() => setActiveTab('assigned')}
              className={`${activeTab === 'assigned'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Tasks Assigned To Me
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {assignedTasks.length}
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


        {/* Tasks Grid */}
        <div className="w-full">
          {
            (tasks.length > 0) &&
            <div className='flex group'>

              <input
                onChange={handleSelectAllTasks}
                type="checkbox"
                className={`${AllTasksSelected && 'opacity-100'} z-10 opacity-0 group-hover:opacity-100 transition-opacity`}
              />
              <div className="p-4 grid grid-cols-[2fr_2fr_1fr_1fr_1fr_2fr] w-full  items-center gap-4 font-semibold">
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
          {
            (activeTab === 'assigned' ? assignedTasks : activeTab === 'created' ? createdTasks : overdueTasks).map((task) => (
              <div
                key={task._id}>


                <TaskCard
                  selectedTasks={selectedTasks}
                  setSelectedTasks={setSelectedTasks}
                  users={users}
                  task={task}
                  handleUpdateTask={handleUpdateTask}
                />
              </div>

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
