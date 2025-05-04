'use client'

import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/state/hooks';
import { login } from '@/state/userSlice';
import { User } from '@/utils/api';


export default function Home() {

  const dispatch = useAppDispatch()

  const [parsedUser, setParsedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      dispatch(login(parsed));
      setParsedUser(parsed);
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
  if (!parsedUser) {
    return (
      redirect('/auth/login')
    )
  }

  return (
    redirect('/dashboard')
  );
}
