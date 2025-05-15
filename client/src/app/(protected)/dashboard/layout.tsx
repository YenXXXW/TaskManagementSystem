import { ReactNode } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* This is where the page-specific content will render */}
      {children}
    </>
  );
} 
