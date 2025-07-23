'use client';

import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full', className)}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function LoadingOverlay() {
  const { loading } = useStore();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
        <LoadingSpinner className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-medium">Chargement...</span>
      </div>
    </div>
  );
}
