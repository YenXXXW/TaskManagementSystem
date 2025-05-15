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

      <nav className="-mb-px flex space-x-8 items-center">
        <button
          onClick={() => handleToggle('status')}
          className={`${currentView === 'status'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          By Status
        </button>
        <button
          onClick={() => handleToggle('priority')}
          className={`${currentView === 'priority'
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
        >
          By Priority
        </button>
      </nav>
    </div>
  );
}

