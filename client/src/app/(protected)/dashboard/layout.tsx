import { ReactNode } from 'react';
import { cookies } from 'next/headers';

export default async function DashboardLayout({ children }: { children: ReactNode }) {


  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  console.log('token in dashboard layout', token)
  return (
    <>
      {/* This is where the page-specific content will render */}
      {children}
    </>
  );
} 
