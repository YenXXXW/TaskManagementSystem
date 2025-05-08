'use client'

import { format } from 'date-fns'
import React, { useState, useEffect } from 'react';
import { useAppSelector } from "@/state/hooks"
import { api, Task } from '@/utils/api';


export default function TaskStats() {
  const tasksFromSlice = useAppSelector(state => state.task.tasks)


  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [createdTasks, setCreatedTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverDueTasks] = useState<Task[]>([])
  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'overdue'>('created');
  const [nearDeadlineTasks, setNearDeadlineTasks] = useState<Task[]>([])

  const user = useAppSelector(state => state.user.user)


  const getTasksCount = (statusType: string) => {
    if (activeTab === "created") {
      return createdTasks.filter(t => t.status === statusType).length

    } else if (activeTab === "assigned") {

      return assignedTasks.filter(t => t.status === statusType).length
    } else if (activeTab === 'overdue') {
      return overdueTasks.filter(t => t.status === statusType).length
    }
  }


  const fectchNearDealineTasks = async () => {
    const res = await api.tasks.getNearDeathlineTasks()
    setNearDeadlineTasks(res)
  }

  useEffect(() => {

    fectchNearDealineTasks()
  }, [])


  useEffect(() => {
    if (tasksFromSlice.length && user) {
      const assigned = tasksFromSlice.filter(task => (task.assignedTo?._id === user._id));
      const created = tasksFromSlice.filter(task => (task.createdBy._id === user._id));
      const overdueTasks = tasksFromSlice.filter(task => (task.isOverdue));
      setOverDueTasks(overdueTasks)
      setAssignedTasks(assigned)
      setCreatedTasks(created)
    }
  }, [tasksFromSlice])
  return (
    <div>
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

        </nav>
      </div>
      < div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8" >
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
                  <dd className="text-lg font-semibold text-gray-900">{activeTab === "created" ? createdTasks.length : activeTab === 'assigned' ? assignedTasks.length : overdueTasks.length}</dd>
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
      </div >
    </div>
  )
}
