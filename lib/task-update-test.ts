// Test utility for task updates
import { API_BASE_URL } from './api';

/**
 * Test function to directly update a task with a minimal payload
 * This is designed to work around Jackson deserialization issues
 */
export async function testDirectTaskUpdate(id: number): Promise<void> {
  try {
    console.log(`Testing direct task update for ID ${id}`);
    
    // Minimal task data with only the fields we want to update
    const minimalTask = {
      name: "Updated Task Name",
      description: "Updated description via direct API call",
      progress: 50,
      progressStatus: "ON_SCHEDULE"
    };
    
    const url = `${API_BASE_URL}/api/tasks/${id}`;
    console.log(`Making direct request to ${url}`);
    
    // First attempt: Using fetch with explicit Content-Type header
    console.log('Attempt 1: Using fetch with explicit Content-Type header');
    try {
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      
      // Log the exact headers being sent
      console.log('Headers being sent:', Array.from(headers.entries()));
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(minimalTask),
        credentials: 'include'
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      // Log response headers
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('Response headers:', responseHeaders);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success! Updated task:', data);
        return;
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Fetch attempt failed:', error);
    }
    
    // Second attempt: Using XMLHttpRequest
    console.log('Attempt 2: Using XMLHttpRequest with explicit Content-Type');
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;
      
      // Create a promise to handle the XHR
      await new Promise<void>((resolve, reject) => {
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('Success! Status:', xhr.status);
            console.log('Response:', xhr.responseText);
            resolve();
          } else {
            console.error('XHR failed with status:', xhr.status);
            console.error('Response:', xhr.responseText);
            reject(new Error(`Failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = function() {
          console.error('Network error occurred');
          reject(new Error('Network error occurred'));
        };
        
        const jsonStr = JSON.stringify(minimalTask);
        console.log('Sending payload:', jsonStr);
        xhr.send(jsonStr);
      });
      return;
    } catch (error) {
      console.error('XMLHttpRequest attempt failed:', error);
    }
    
    // Third attempt: Using POST with X-HTTP-Method-Override
    console.log('Attempt 3: Using POST with method override');
    try {
      const formData = new FormData();
      formData.append('task', JSON.stringify(minimalTask));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-HTTP-Method-Override': 'PUT'
        },
        body: formData,
        credentials: 'include'
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Success! Updated task:', data);
        return;
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('POST with override attempt failed:', error);
    }
    
    console.error('All attempts failed to update task');
  } catch (error) {
    console.error('Test update failed:', error);
  }
}
