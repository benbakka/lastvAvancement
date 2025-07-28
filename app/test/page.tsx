'use client';

import { TaskUpdateTest } from '@/components/task-update-test';

export default function TestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Testing Page</h1>
      <TaskUpdateTest />
    </div>
  );
}
