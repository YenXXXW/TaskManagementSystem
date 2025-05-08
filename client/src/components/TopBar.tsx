'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { clearNotifications, connectSocket } from '@/state/socketSlice';
import { api, Task } from '@/utils/api';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconfilled } from '@heroicons/react/24/solid';
import { addNotification } from '@/state/socketSlice';
import { useRef } from 'react';
import { Notification } from '@/utils/api';
import NotiCard from '@/components/NotiCard';
import { addTask, clearTasks } from '@/state/taskSlice';
import { logout } from '@/state/userSlice';

export default function TopBar({
  children,
}: {

  token: string,
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const [notfications, setNotifications] = useState<Notification[]>([])
  const [showNotiView, setShowNotiView] = useState(false)
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [unreadNotis, setUnradNotis] = useState<string[]>([])
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchRes, setSearchRes] = useState<Task[]>([])

  const liveNoti = useAppSelector(state => state.socket.notifications)

  const notiRef = useRef<HTMLDivElement | null>(null)
  const notiButtonRef = useRef<HTMLButtonElement | null>(null)

  const userFromSlice = useAppSelector(state => state.user.user)
  const notiFromSlice = useAppSelector(state => state.socket.notifications)
  const token = useAppSelector(state => state.user.token)

  const pathname = usePathname();
  const noLayout = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup');

  const fetchTasks = async (token: string) => {

    const tasks = await api.tasks.getAll(token)
    dispatch(addTask(tasks))
  }

  useEffect(() => {

    console.log("thsi trigger")
    console.log("user form Slice", userFromSlice)
    if (userFromSlice) {
      setUserName(userFromSlice.name)

      dispatch(connectSocket(userFromSlice._id))
      getNotifications(userFromSlice._id)
    } else {
      setUserName('')
    }
  }, [userFromSlice])

  useEffect(() => {
    console.log("token is", token)
    if (token !== '') {
      fetchTasks(token)
    }
  }, [token])

  useEffect(() => {
    setNotifications([...liveNoti])
    const unreadIds = liveNoti.flatMap(noti => !noti.isRead ? [noti._id] : []);
    setUnradNotis(unreadIds)

  }, [liveNoti])

  const getNotifications = async (userId: string) => {
    const notis = await api.notis.getAll(userId)
    dispatch(addNotification(notis))

  }

  useEffect(() => {
    setNotifications(notiFromSlice)

    const unreadIds = notiFromSlice.flatMap(noti => !noti.isRead ? [noti._id] : []);
    setUnradNotis(unreadIds)
  }, [notiFromSlice])

  const handleNotiRead = async () => {

    try {
      console.log("unread notis", unreadNotis)
      if (unreadNotis.length) {
        await api.notis.markRead({ ids: unreadNotis })
        const updateNotis = notfications.map(noti => ({
          ...noti,
          isRead: true
        }))
        setNotifications(updateNotis)
        setUnradNotis([])
      }
    } catch (error) {
      console.log("error updatig notifications", error)
    }
  }

  const handleSearch = async (search: string) => {
    try {
      setShowSearchModal(true)
      const res = await api.tasks.search(search.trim())
      setSearchRes(res)
      console.log(res)
    } catch (err) {
      console.log("error performing search", err)
    }


  }



  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notiRef.current && !notiRef.current.contains(event.target as Node)) {
        setShowNotiView(false);
      }

    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //useEffect(() => {
  //
  //console.log("this again")
  //const user = localStorage.getItem('user');
  //
  //
  //if (user) {
  //try {
  //const parsedUser = JSON.parse(user);
  //console.log(parsedUser)
  //dispatch(connectSocket(parsedUser._id))
  //setUserName(parsedUser.name || '');
  //getNotifications(parsedUser._id)
  //
  //} catch (error) {
  //console.error('Error parsing user data:', error);
  //}
  //}
  //}, []);



  const isActive = (path: string) => {
    return pathname === path;
  };

  const getButtonStyle = (path: string) => {
    return isActive(path)
      ? 'text-blue-600 font-semibold text-sm border-b-2 border-indigo-600 pb-1'
      : 'text-gray-700 hover:text-blue-600 text-sm font-semibold';
  };


  const handleLogout = async () => {
    await api.auth.logout()
    dispatch(clearNotifications())
    dispatch(clearTasks())
    dispatch(logout())

    router.push('/auth/login');
  };


  if (noLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Main Content */}
      <div className={`flex-1  transition-all duration-200 ease-in-out`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page Content */}
        <main className="p-6">
          <div className="flex justify-between relative items-center mb-5">
            <div className='flex gap-10'>
              <button
                onClick={() => router.push('/dashboard')}
                className={getButtonStyle('/dashboard')}>
                Overview
              </button>
              <button
                onClick={() => router.push('/tasks')}
                className={getButtonStyle('/tasks')}>
                Tasks
              </button>
              <button
                onClick={() => router.push('/board')}
                className={getButtonStyle('/board')}>
                Board
              </button>

            </div>
            <div className='flex gap-5 items-center'>
              <div className='relative'>
                <input

                  className={`focus:w-[400px] border-2 px-1 border-gray-600 rounded-md focus:outline-none`}
                  onChange={(e) => handleSearch(e.target.value)}
                  onBlur={() => setTimeout(() => setShowSearchModal(false), 100)}
                />
                {
                  showSearchModal && (
                    <div className='absolute z-10 bg-white p-2 top-full max-h-[60vh] overflow-auto right-0 w-[400px] flex flex-col gap-2'>
                      {
                        searchRes && searchRes.length > 0 && searchRes.map(res => (
                          <div
                            onClick={() => {
                              console.log(`/tasks/${res._id}`)
                              router.push(`/tasks/${res._id}`)
                              setShowSearchModal(false)
                            }}
                            className='cursor-pointer' key={res._id}>
                            <p className='text-sm font-semibold'>{res.title}</p>
                            <p className='text-xs font-thin'>{res.description} </p>
                          </div>
                        ))
                      }
                    </div>

                  )
                }

              </div>
              <div className="relative hover:bg-blue-200 cursor-pointer rounded-full w-10 h-10 flex items-center justify-center">
                <button
                  ref={notiButtonRef}
                  onClick={async () => {
                    setShowNotiView(!showNotiView)

                    await handleNotiRead()
                  }
                  }>
                  {
                    showNotiView ?

                      <BellIconfilled className='h-6 w-6  text-blue-500' />
                      :

                      <BellIcon className="h-6 w-6  text-blue-500" />
                  }

                </button>
                {unreadNotis.length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                    {unreadNotis.length}
                  </span>
                )}
                {
                  showNotiView &&


                  <div
                    ref={notiRef}
                    className='absolute p-6 rounded-md z-30 bg-white top-full right-0 w-[400px] max-h-[400px] overflow-y-auto'
                  >
                    <h3 className='font-bold text-2xl mb-4'>Nofitcations</h3>
                    <div className='flex flex-col gap-2'>
                      {

                        notfications.length > 0 ?
                          notfications.map((noti) => (
                            <div key={noti._id}>
                              <NotiCard notifiation={noti} />
                            </div>
                          ))
                          :
                          <p>
                            no notifications
                          </p>
                      }
                    </div>
                  </div>
                }

              </div>

              <div className="p-4 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {userName}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>


          </div>
          {children}
        </main>
      </div >
    </div >
  );
}

