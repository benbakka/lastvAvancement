'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { testDirectTaskUpdate } from '@/lib/task-update-test';

export function TaskUpdateTest() {
  const [taskId, setTaskId] = useState<string>('1');
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!taskId || isNaN(parseInt(taskId))) {
      toast({
        title: "Invalid Task ID",
        description: "Please enter a valid task ID number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await testDirectTaskUpdate(parseInt(taskId));
      toast({
        title: "Test Completed",
        description: "Check browser console for detailed results",
        variant: "default"
      });
    } catch (error) {
      console.error('Test failed:', error);
      toast({
        title: "Test Failed",
        description: "See browser console for error details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Task Update Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="taskId" className="text-sm font-medium">
              Task ID
            </label>
            <Input
              id="taskId"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              placeholder="Enter task ID"
            />
          </div>
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testing..." : "Test Task Update"}
          </Button>
          <div className="text-sm text-gray-500 mt-2">
            <p>This will attempt to update the task using multiple approaches:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Fetch with explicit Content-Type header</li>
              <li>XMLHttpRequest with controlled headers</li>
              <li>POST with X-HTTP-Method-Override header</li>
            </ol>
            <p className="mt-2">Check browser console for detailed logs.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
