import React, { useState, useEffect } from 'react';
import { apiService } from '../lib/api';
import { Project } from '../lib/types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, AlertCircle, Code as CodeIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [logs, setLogs] = useState<string[]>([]);

  // Helper function to add logs
  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : '🔍 ';
    setLogs(prev => [`${prefix} ${timestamp}: ${message}`, ...prev]);
  };

  // Test backend connection
  const testConnection = async () => {
    setLoading(true);
    setBackendStatus('unknown');
    setError(null);
    
    addLog('Testing backend connection...');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      addLog(`Connecting to backend at: ${apiUrl}`);
      
      const response = await fetch(`${apiUrl}/health`, {
        mode: 'cors',
        credentials: 'include',
      });
      
      if (response.ok) {
        setBackendStatus('connected');
        addLog('Backend connection successful!', 'success');
      } else {
        setBackendStatus('error');
        addLog(`Backend returned status: ${response.status} ${response.statusText}`, 'error');
        setError(`Backend error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      setBackendStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Connection failed: ${errorMessage}`, 'error');
      setError(errorMessage);
      
      // Add CORS debugging info
      if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
        addLog('Possible CORS issue detected', 'error');
        addLog(`Origin: ${window.location.origin}`, 'info');
        addLog(`Browser: ${navigator.userAgent}`, 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    
    addLog('Fetching projects from backend...');
    
    try {
      const fetchedProjects = await apiService.getProjects();
      setProjects(fetchedProjects);
      addLog(`Successfully fetched ${fetchedProjects.length} projects`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Error fetching projects: ${errorMessage}`, 'error');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto test connection on page load
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      
      <div className="flex flex-wrap gap-6 mb-8">
        <Card className="w-full md:w-auto">
          <CardHeader>
            <CardTitle className="text-lg">Backend Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : backendStatus === 'connected' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-500 font-medium">Connected</span>
                </>
              ) : backendStatus === 'error' ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="text-red-500 font-medium">Error</span>
                </>
              ) : (
                <span>Unknown</span>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full md:w-auto">
          <CardHeader>
            <CardTitle className="text-lg">API URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-100 p-2 rounded font-mono text-sm">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-wrap gap-4 mb-6">
        <Button 
          variant="default" 
          onClick={testConnection} 
          disabled={loading}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Test Backend Connection
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={fetchProjects} 
          disabled={loading || backendStatus !== 'connected'}
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Fetch Projects
        </Button>
      </div>
      
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Projects ({projects.length})</h2>
          <div className="flex flex-col gap-3">
            {projects.map(project => (
              <Card 
                key={`project-${project.id}`} 
                className="shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-medium">{project.name}</h3>
                    <Badge variant="outline">ID: {project.id}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Debug Logs</h2>
        <Card className="shadow-sm">
          <ScrollArea className="h-[300px] font-mono text-sm">
            <CardContent>
              {logs.map((log, i) => (
                <p key={`log-${i}`} className="mb-1">{log}</p>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
