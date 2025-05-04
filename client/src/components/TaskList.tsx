'use client';

import { useState, useEffect, useRef } from 'react';
import { api, Task, User, UpdateTaskData } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/state/hooks';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'created'>('assigned');
  const router = useRouter();
  const user = useAppSelector(state => state.user.user)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '',
  });


  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);


  useEffect(() => {
    if (tasks.length && user) {
      const assigned = tasks.filter(task => task.assignedTo?._id === user._id);
      const created = tasks.filter(task => task.createdBy._id === user._id);
      setAssignedTasks(assigned)
      setCreatedTasks(created)
    }
  }, [tasks])

  const getTasksCount = (statusType: string) => {
    if (activeTab === "created") {
      return createdTasks.filter(t => t.status === statusType).length

    } else if (activeTab === "assigned") {

      return assignedTasks.filter(t => t.status === statusType).length
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
      setLoading(true);
      const data = await api.tasks.getAll();
      setTasks(data);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.tasks.create(newTask);
      setShowCreateModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        assignedTo: '',
      });
      fetchTasks();
    } catch (error) {
      setError('Failed to create task');
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (editTask: Task) => {
    if (!user) return
    console.log("editTask", editTask)
    const { _id, ...updatedTask } = editTask

    try {
      await api.tasks.update(_id, {
        updatedBy: user._id,
        ...updatedTask
      } as UpdateTaskData);
      setShowEditModal(false);
      await fetchTasks();
    } catch (error) {
      setError('Failed to update task');
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.tasks.delete(taskId);
      await fetchTasks();
    } catch (error) {
      setError('Failed to delete task');
      console.error('Failed to delete task:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }



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
          <div className='relative'>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Task
            </button>
            {showCreateModal && (
              <div className="absolute left:0 md:right-0 top-20 md:top-12 rounded-md bg-blue-500 text-white flex items-center justify-center">
                <div className="p-6 rounded-lg w-[300px] max-w-md">
                  <h2 className="text-xl font-bold mb-4">Create Task</h2>
                  <form onSubmit={handleCreateTask}>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Title</label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        className="w-full text-sm  px-3 py-2 bg-black/20 rounded"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Description</label>
                      <textarea
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        className="w-full text-sm  px-3 py-2 bg-black/20 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="w-full text-sm  px-3 py-2 bg-black/20 rounded"
                      />
                    </div>
                    <div className="mb-4">

                      <label className="block text-sm font-semibold mb-2">Priority</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full text-sm  px-3 py-2 bg-black/20 rounded"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold mb-2">Assign To</label>
                      <select
                        value={newTask.assignedTo}
                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        className="w-full text-sm  px-3 py-2 bg-black/20 rounded"
                      >
                        <option value="">Select User</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-1 text-sm font-semibold rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 bg-white text-sm text-blue-500 rounded hover:bg-green-50"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
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
          <div className="p-4 grid grid-cols-[200px_200px_120px_120px_120px_120px] items-center gap-4 font-semibold ">
            <div>Title</div>
            <div>Description</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Due Date</div>
            <div>Assignee</div>
          </div>
          {(activeTab === 'assigned' ? assignedTasks : createdTasks).map((task) => (
            <TaskCard
              users={users}
              key={task._id}
              task={task}
              handleUpdateTask={handleUpdateTask}
              onDelete={() => handleDeleteTask(task._id)}
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
function TaskCard({ task, onDelete, users, handleUpdateTask }: {
  task: Task;
  onDelete: () => void;
  users: User[]
  handleUpdateTask: (task: Task) => Promise<void>
}
) {

  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPriority, setEditingPrority] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [editedTask, setEditedTask] = useState(task);
  const [editingAssignee, setEditingAssignee] = useState(false)

  const dateInputRef = useRef<HTMLInputElement | null>(null)

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
    setEditedTask(updatedTask)
    setEditingPrority(false);

    try {
      await handleUpdateTask(editedTask)
    } catch (err) {
      console.log("error udating taks", err)
    }
  };


  const handleAssingeeChange = async (assignedTo: User) => {
    setEditedTask(prev => ({ ...prev, assignedTo }));
    setEditingAssignee(false)

    try {
      await handleUpdateTask(editedTask)
    } catch (err) {
      console.log("error upading assigne", err)
    }
  };

  const handleDueDateChange = (newDate: string) => {
    setEditedTask((prev) => ({ ...prev, dueDate: newDate }));
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
    <div className=" shadow rounded-lg hover:shadow-lg transition-shadow duration-200">

      <div className="p-4 grid grid-cols-[200px_200px_120px_120px_120px_120px] items-center gap-4">
        {/* Title + Actions */}
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 truncate">{task.description}</p>

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
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(editedTask.status)} hover:bg-gray-200 transition duration-300`}
            title="Click to change status"
          >
            {editedTask.status}
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
            {new Date(editedTask.dueDate).toLocaleDateString() || "Set due date"}
          </span>

        </div>

        {/* Assignee */}
        <div className="flex relative items-center text-sm text-gray-500">
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
            onClick={() => setEditingAssignee(true)}
            className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {editedTask.assignedTo?.name || 'Unassigned'}
        </div>
      </div>
    </div>



  );
} 
