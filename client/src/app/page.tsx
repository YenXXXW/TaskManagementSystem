'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/state/hooks';
import { login } from '@/state/userSlice';
import { AuthResponse, User } from '@/utils/api';


export default function Home() {

  const dispatch = useAppDispatch()

  const [parsedUser, setParsedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('')

  console.log(parsedUser, token)

  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token')
    if (user && token) {
      const parsed = JSON.parse(user);
      const obj: AuthResponse = {
        status: 'success',
        token: token,
        data: {
          user: parsed
        }
      }
      dispatch(login(obj));
      setParsedUser(parsed);
      setToken(token)
    }
    setLoading(false);
  }, [dispatch]);


  if (loading) {
    return (
      <div>
        loading
      </div>
    )
  }
  return (
    redirect('/login')
  )

}
