'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function BoardToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'status';

  const handleToggle = (view: 'status' | 'priority') => {
    router.replace(`?view=${view}`);
  };

  return (
    <div className="mb-4 flex gap-2">
      <button
        onClick={() => handleToggle('status')}
        className={`px-4 py-2 rounded ${currentView === 'status' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        By Status
      </button>
      <button
        onClick={() => handleToggle('priority')}
        className={`px-4 py-2 rounded ${currentView === 'priority' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
      >
        By Priority
      </button>
    </div>
  );
}

