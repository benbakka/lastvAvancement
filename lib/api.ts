import { Project, Villa, Category, Team, Task, User, Template } from './types';
import type { Notification } from './types';
import { useStore } from './store';

// Connect directly to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
console.log('API base URL:', API_BASE_URL);

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // The backend context path is set to /api in application.yml
    // We need to add the /api prefix to all endpoints
    const apiEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
    const url = `${API_BASE_URL}${apiEndpoint}`;
    console.log(`🌐 Sending request to: ${url} (original endpoint: ${endpoint}, with /api prefix: ${apiEndpoint})`, options?.method || 'GET');
    
    // Log request body for debugging if it exists
    if (options?.body) {
      try {
        const bodyObj = JSON.parse(options.body.toString());
        console.log('📦 Request body:', bodyObj);
      } catch (e) {
        console.log('Could not parse request body for logging');
      }
    }
    
    try {
      // Enhanced fetch configuration with proper CORS settings
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        mode: 'cors',
        credentials: 'include', // Send cookies if needed
        ...options,
      });
      
      // Log all responses for debugging
      console.log(`✅ API response from ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 403) {
          console.error('❌ Authorization error: Forbidden access');
          throw new Error('Authorization error: You do not have permission to access this resource.');
        } else if (response.status === 401) {
          console.error('❌ Authentication error: Unauthorized access');
          throw new Error('Authentication error: Please log in to access this resource.');
        } else {
          console.error(`❌ API request failed: ${response.status} ${response.statusText}`);
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
      }

      // Try to parse the response as JSON
      try {
        const responseData = await response.json();
        console.log('📦 Response data:', responseData);
        return responseData;
      } catch (jsonError) {
        console.error('❌ Failed to parse JSON response:', jsonError);
        // Try to get the raw text for debugging
        try {
          const text = await response.text();
          console.error('Raw response text:', text);
        } catch (e) {
          console.error('Could not get raw response text');
        }
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('❌ CORS or network error:', error);
        console.error('🔍 CORS Debugging Info:', {
          origin: window.location.origin,
          targetApi: url,
          method: options?.method || 'GET',
          headers: options?.headers || 'default headers',
          time: new Date().toISOString()
        });
        throw new Error(`Network error: Could not connect to the backend server. Please ensure the backend is running at ${API_BASE_URL} and CORS is properly configured.`);
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('❌ Request was aborted:', error);
        throw new Error('Request was aborted. This might be due to a timeout or a connection issue.');
      } else if (error instanceof Error && (error.message.includes('NetworkError') || error.message.includes('CORS'))) {
        console.error('❌ CORS policy error:', error);
        console.error('🔍 Detailed CORS Debugging Info:', {
          origin: window.location.origin,
          targetApi: url,
          method: options?.method || 'GET',
          corsMode: options?.mode || 'cors',
          credentials: options?.credentials || 'include',
          headers: options?.headers || 'default headers',
          browser: navigator.userAgent,
          time: new Date().toISOString()
        });
        throw new Error(`CORS policy error: The backend server at ${API_BASE_URL} is blocking cross-origin requests. Check backend CORS configuration.`);
      }
      console.error('❌ Unknown API error:', error);
      throw error;
    }
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      console.log('📊 Fetching projects from:', `${API_BASE_URL}/api/projects`);
      const projects = await this.request<Project[]>('/api/projects');
      console.log('📊 Projects data received successfully:', projects.length, 'projects');
      
      // Process the response to ensure proper type conversion
      return projects.map(project => ({
        ...project,
        id: project.id ? project.id.toString() : `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Generate unique ID if not present
        startDate: new Date(project.startDate),
        endDate: new Date(project.endDate),
        createdAt: project.createdAt ? new Date(project.createdAt) : undefined,
        updatedAt: project.updatedAt ? new Date(project.updatedAt) : undefined
      }));
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info:', {
          origin: window.location.origin,
          targetApi: API_BASE_URL,
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    // Convert Date objects to ISO strings for the API
    const projectData = {
      ...project,
      startDate: project.startDate instanceof Date ? project.startDate.toISOString() : project.startDate,
      endDate: project.endDate instanceof Date ? project.endDate.toISOString() : project.endDate
    };
    
    try {
      console.log('📝 Creating new project:', projectData.name);
      const createdProject = await this.request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      
      console.log('✅ Project created successfully:', createdProject);
      
      // Process the response to ensure proper type conversion
      return {
        ...createdProject,
        id: createdProject.id ? createdProject.id.toString() : `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        startDate: new Date(createdProject.startDate),
        endDate: new Date(createdProject.endDate),
        createdAt: createdProject.createdAt ? new Date(createdProject.createdAt) : undefined,
        updatedAt: createdProject.updatedAt ? new Date(createdProject.updatedAt) : undefined
      };
    } catch (error) {
      console.error('❌ Failed to create project:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for create project:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/projects`,
          requestMethod: 'POST',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    // Convert Date objects to ISO strings for the API
    const projectData = {
      ...project,
      startDate: project.startDate instanceof Date ? project.startDate.toISOString() : project.startDate,
      endDate: project.endDate instanceof Date ? project.endDate.toISOString() : project.endDate
    };
    
    try {
      // Note: Backend expects numeric ID while frontend uses string IDs
      const numericId = parseInt(id, 10);
      console.log(`🛠 Updating project ${id}:`, projectData);
      
      if (isNaN(numericId)) {
        console.warn(`⚠ Warning: Non-numeric ID ${id} being sent to backend. Backend expects numeric IDs.`);
      }
      
      const updatedProject = await this.request<Project>(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      });
      
      console.log('✅ Project updated successfully:', updatedProject);
      
      // Process the response to ensure proper type conversion
      return {
        ...updatedProject,
        id: updatedProject.id ? updatedProject.id.toString() : id, // Use existing ID if backend doesn't return one
        startDate: new Date(updatedProject.startDate),
        endDate: new Date(updatedProject.endDate),
        createdAt: updatedProject.createdAt ? new Date(updatedProject.createdAt) : undefined,
        updatedAt: updatedProject.updatedAt ? new Date(updatedProject.updatedAt) : undefined
      };
    } catch (error) {
      console.error(`❌ Failed to update project ${id}:`, error);
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          console.error('🔍 CORS Debugging Info for update project:', {
            origin: window.location.origin,
            targetApi: `${API_BASE_URL}/projects/${id}`,
            requestMethod: 'PUT',
            browser: navigator.userAgent
          });
        } else if (error.message.includes('404')) {
          console.error(`⚠ Project with ID ${id} not found on the server. Check if ID conversion is correct.`);
        }
      }
      throw error;
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      // Note: Backend expects numeric ID while frontend uses string IDs
      const numericId = parseInt(id, 10);
      console.log(`🗑️ Deleting project ${id}`);
      
      if (isNaN(numericId)) {
        console.warn(`⚠ Warning: Non-numeric ID ${id} being sent to backend. Backend expects numeric IDs.`);
      }
      
      await this.request<void>(`/projects/${id}`, {
        method: 'DELETE',
      });
      console.log(`✅ Project ${id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Failed to delete project ${id}:`, error);
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          console.error('🔍 CORS Debugging Info for delete project:', {
            origin: window.location.origin,
            targetApi: `${API_BASE_URL}/projects/${id}`,
            requestMethod: 'DELETE',
            browser: navigator.userAgent
          });
        } else if (error.message.includes('404')) {
          console.error(`⚠ Project with ID ${id} not found on the server. Check if ID conversion is correct.`);
        }
      }
      throw error;
    }
  }

  // Villas
  async getVillas(projectId?: string): Promise<Villa[]> {
    try {
      // Construct the endpoint with the proper query parameter
      // The backend controller expects a numeric projectId parameter if filtering by project
      // We need to convert the string projectId to a number for the backend
      const numericProjectId = projectId ? parseInt(projectId, 10) : undefined;
      const endpoint = numericProjectId ? `/villas?projectId=${numericProjectId}` : '/villas';
      console.log(`🏠 Fetching villas from endpoint: ${endpoint}`);
      
      const response = await this.request<any[]>(endpoint);
      console.log('🏠 Villas data received:', JSON.stringify(response));
      
      if (!Array.isArray(response)) {
        console.error('API response is not an array:', response);
        return [];
      }
      
      return response.map(villa => {
        console.log('Processing villa:', JSON.stringify(villa));
        
        // Handle the project relationship - backend uses @JsonBackReference which can exclude project data
        // If project is missing, use the projectId from the query parameter
        let villaProjectId = projectId || '';
        
        // The backend Villa entity uses @JsonBackReference on the project field,
        // which means the project data is excluded during serialization
        // We need to explicitly set the projectId from the query parameter
        if (projectId) {
          villaProjectId = projectId;
          console.log(`Villa ${villa.id} using query parameter projectId: ${villaProjectId}`);
        } else if (villa.project && villa.project.id) {
          villaProjectId = villa.project.id.toString();
          console.log(`Villa ${villa.id} using project.id: ${villaProjectId}`);
        } else if (villa.projectId) {
          villaProjectId = villa.projectId.toString();
          console.log(`Villa ${villa.id} using villa.projectId: ${villaProjectId}`);
        } else if (projectId) {
          // Already set as default above
          console.log(`Villa ${villa.id} using query parameter projectId: ${villaProjectId}`);
        } else {
          // If no project association at all, log warning and use empty string
          console.warn(`Villa ${villa.id} has no project association! Using empty string.`);
          villaProjectId = '';
        }
        
        // Handle the status enum - backend uses uppercase enum values (NOT_STARTED, IN_PROGRESS, etc.)
        // Frontend expects lowercase string literals (not_started, in_progress, etc.)
        let status = 'not_started';
        if (villa.status) {
          // Convert backend enum to frontend format
          const statusStr = villa.status.toString().toLowerCase();
          console.log(`Villa ${villa.id} original status: ${villa.status}`);
          
          // Map all possible backend status values to frontend format
          if (statusStr === 'not_started' || statusStr === 'not started' || statusStr === 'notstarted') {
            status = 'not_started';
          } else if (statusStr === 'in_progress' || statusStr === 'in progress' || statusStr === 'inprogress') {
            status = 'in_progress';
          } else if (statusStr === 'completed') {
            status = 'completed';
          } else if (statusStr === 'delayed') {
            status = 'delayed';
          }
          
          console.log(`Villa ${villa.id} converted status: ${status}`);
        }
        
        return {
          id: villa.id ? villa.id.toString() : `temp-${Date.now()}`,
          projectId: villaProjectId,
          name: villa.name || '',
          type: villa.type || '',
          surface: villa.surface || 0,
          progress: villa.progress || 0,
          status: status as 'not_started' | 'in_progress' | 'completed' | 'delayed',
          categoriesCount: villa.categoriesCount || 0,
          tasksCount: villa.tasksCount || 0,
          lastModified: villa.lastModified ? new Date(villa.lastModified) : new Date()
        };
      });
    } catch (error) {
      console.error('❌ Failed to fetch villas:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for get villas:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/api/villas`,
          requestMethod: 'GET',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  async createVilla(villaData: any): Promise<Villa> {
    try {
      console.log('📝 Creating new villa:', villaData.name);
      
      // Prepare the data for the backend
      const backendData = {
        ...villaData,
        // Convert project ID from string to numeric if needed
        project: {
          id: parseInt(villaData.projectId || villaData.project?.id || '0')
        },
        // Convert status to uppercase for backend enum
        status: villaData.status?.toUpperCase()
      };
      
      console.log('Sending villa data to backend:', backendData);
      
      // Use the correct API endpoint to match backend controller path
      const response = await this.request<any>('/villas', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
      
      console.log('✅ Villa created successfully:', response);
      
      // Process the response to ensure proper type conversion for the frontend
      return {
        id: response.id ? response.id.toString() : `temp-${Date.now()}`, // Convert numeric ID to string for frontend
        projectId: response.project?.id?.toString() || villaData.projectId || '',
        name: response.name || '',
        type: response.type || '',
        surface: response.surface || 0,
        progress: response.progress || 0,
        // Convert backend enum to frontend format
        status: (response.status?.toLowerCase() || 'not_started') as 'not_started' | 'in_progress' | 'completed' | 'delayed',
        categoriesCount: response.categoriesCount || 0,
        tasksCount: response.tasksCount || 0,
        lastModified: response.lastModified ? new Date(response.lastModified) : new Date()
      };
    } catch (error) {
      console.error('❌ Failed to create villa:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for create villa:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/villas`,
          requestMethod: 'POST',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  // Teams methods will be implemented at the end of the class

  async updateVilla(id: string, villa: any): Promise<Villa> {
    try {
      console.log(`🔧 Updating villa ${id}:`, villa);
      
      // Prepare the data for the backend
      const backendData = {
        ...villa,
        // Convert project ID from string to numeric if needed
        projectId: villa.projectId ? Number(villa.projectId) : null,
        // Convert status to uppercase for backend enum
        status: villa.status ? villa.status.toUpperCase() : 'NOT_STARTED'
      };
      
      console.log('Sending villa data to backend:', backendData);
      
      // Use the correct API endpoint with context path
      const updatedVilla = await this.request<any>(`/villas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });
      
      console.log('✅ Villa updated successfully:', updatedVilla);
      
      // Process the response to ensure proper type conversion for the frontend
      return {
        id: updatedVilla.id ? updatedVilla.id.toString() : id, // Convert numeric ID to string for frontend
        projectId: updatedVilla.project?.id?.toString() || villa.projectId || '',
        name: updatedVilla.name || '',
        type: updatedVilla.type || '',
        surface: updatedVilla.surface || 0,
        progress: updatedVilla.progress || 0,
        // Convert backend enum to frontend format
        status: (updatedVilla.status?.toLowerCase() || 'not_started') as 'not_started' | 'in_progress' | 'completed' | 'delayed',
        categoriesCount: updatedVilla.categoriesCount || 0,
        tasksCount: updatedVilla.tasksCount || 0,
        lastModified: updatedVilla.lastModified ? new Date(updatedVilla.lastModified) : new Date()
      };
    } catch (error) {
      console.error(`❌ Failed to update villa ${id}:`, error);
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          console.error('🔍 CORS Debugging Info for update villa:', {
            origin: window.location.origin,
            targetApi: `${API_BASE_URL}/api/villas/${id}`,
            requestMethod: 'PUT',
            browser: navigator.userAgent,
            corsHeaders: {
              'Access-Control-Allow-Origin': window.location.origin,
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization',
              'Access-Control-Allow-Credentials': 'true'
            }
          });
        } else if (error.message.includes('404')) {
          console.error(`⚠ Villa with ID ${id} not found on the server. Check if ID conversion is correct.`);
        } else if (error.message.includes('400')) {
          console.error(`⚠ Bad request when updating villa ${id}. Check data format:`, villa);
        }
      }
      throw error;
    }
  }

  async deleteVilla(id: string): Promise<void> {
    return this.request<void>(`/villas/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories(villaId?: string): Promise<Category[]> {
    const endpoint = villaId ? `/categories?villaId=${villaId}` : '/categories';
    return this.request<Category[]>(endpoint);
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.request<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Teams
  async getTeams(): Promise<Team[]> {
    return this.request<Team[]>('/teams');
  }

  async createTeam(team: Omit<Team, 'id'>): Promise<Team> {
    try {
      console.log('🏗️ Creating team:', team);
      
      // Prepare the data for the backend
      const backendData = {
        ...team,
        // Convert string ID to null so backend can generate a proper ID
        id: null,
        // Convert date to ISO string if it exists
        lastActivity: team.lastActivity ? team.lastActivity.toISOString() : null
      };
      
      console.log('Sending team data to backend:', backendData);
      
      // Use the correct API endpoint to match backend controller path
      const response = await this.request<any>('/teams', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
      
      console.log('✅ Team created successfully:', response);
      
      // Process the response to ensure proper type conversion for the frontend
      return {
        id: response.id ? response.id.toString() : `temp-${Date.now()}`, // Convert numeric ID to string for frontend
        name: response.name || '',
        specialty: response.specialty || '',
        membersCount: response.membersCount || 0,
        activeTasks: response.activeTasks || 0,
        performance: response.performance || 0,
        lastActivity: response.lastActivity ? new Date(response.lastActivity) : new Date()
      };
    } catch (error) {
      console.error('❌ Failed to create team:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for create team:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/teams`,
          requestMethod: 'POST',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  async updateTeam(id: string, team: Partial<Team>): Promise<Team> {
    try {
      console.log(`🔧 Updating team ${id}:`, team);
      
      // Convert string ID to number for backend
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`Invalid team ID: ${id}`);
      }
      
      // Prepare data for backend
      const backendData = {
        ...team,
        // Convert date to ISO string if it exists
        lastActivity: team.lastActivity ? team.lastActivity.toISOString() : undefined
      };
      
      console.log('Sending team update data to backend:', backendData);
      
      const response = await this.request<any>(`/teams/${numericId}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });
      
      console.log('✅ Team updated successfully:', response);
      
      // Process the response to ensure proper type conversion for the frontend
      return {
        id: response.id ? response.id.toString() : id,
        name: response.name || team.name || '',
        specialty: response.specialty || team.specialty || '',
        membersCount: response.membersCount || team.membersCount || 0,
        activeTasks: response.activeTasks || team.activeTasks || 0,
        performance: response.performance || team.performance || 0,
        lastActivity: response.lastActivity ? new Date(response.lastActivity) : 
                      team.lastActivity || new Date()
      };
    } catch (error) {
      console.error(`❌ Failed to update team ${id}:`, error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for update team:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/teams/${id}`,
          requestMethod: 'PUT',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  async deleteTeam(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting team ${id}`);
      
      // Convert string ID to number for backend
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error(`Invalid team ID: ${id}`);
      }
      
      await this.request<void>(`/teams/${numericId}`, {
        method: 'DELETE',
      });
      
      console.log(`✅ Team ${id} deleted successfully`);
    } catch (error) {
      console.error(`❌ Failed to delete team ${id}:`, error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for delete team:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/teams/${id}`,
          requestMethod: 'DELETE',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  // Tasks
  async getTasks(categoryId?: string): Promise<Task[]> {
    const endpoint = categoryId ? `/tasks?categoryId=${categoryId}` : '/tasks';
    return this.request<Task[]>(endpoint);
  }

  async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    try {
      // Convert the task data to match the backend's expected format
      // IMPORTANT: Backend expects numeric IDs, not string IDs
      const backendTask = {
        name: task.name,
        description: task.description || '',
        category: { id: Number(task.categoryId) }, // Convert string ID to number
        villa: { id: Number(task.villaId) }, // Convert string ID to number
        team: task.teamId ? { id: Number(task.teamId) } : null, // Convert string ID to number if present
        startDate: task.startDate instanceof Date ? task.startDate.toISOString().split('T')[0] : task.startDate,
        endDate: task.endDate instanceof Date ? task.endDate.toISOString().split('T')[0] : task.endDate,
        plannedStartDate: task.plannedStartDate instanceof Date ? task.plannedStartDate.toISOString().split('T')[0] : task.plannedStartDate,
        plannedEndDate: task.plannedEndDate instanceof Date ? task.plannedEndDate.toISOString().split('T')[0] : task.plannedEndDate,
        status: task.status.toUpperCase(), // Backend expects uppercase enum values
        progress: task.progress,
        progressStatus: task.progressStatus.toUpperCase(), // Backend expects uppercase enum values
        isReceived: task.isReceived,
        isPaid: task.isPaid,
        amount: task.amount || 0, // Ensure amount is not undefined
        photos: task.photos || [],
        remarks: task.remarks || ''
      };
      
      console.log('Sending task to backend with converted IDs:', {
        categoryId: backendTask.category.id,
        villaId: backendTask.villa.id,
        teamId: backendTask.team?.id
      });
      
      // Add explicit debugging for the request
      const response = await this.request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(backendTask),
      });
      
      console.log('Task created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating task in API service:', error);
      console.error('Request payload that failed:', JSON.stringify(task));
      throw error; // Re-throw to allow handling in the component
    }
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: string): Promise<void> {
    return this.request<void>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return this.request<Template[]>('/templates');
  }

  async createTemplate(template: Omit<Template, 'id'>): Promise<Template> {
    return this.request<Template>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async applyTemplate(templateId: string, villaId: string): Promise<void> {
    return this.request<void>(`/templates/${templateId}/apply/${villaId}`, {
      method: 'POST',
    });
  }

  // AI Assistant
  async getAIRecommendations(): Promise<any[]> {
    return this.request<any[]>('/ai/recommendations');
  }

  // Load all initial data
  async loadInitialData(): Promise<void> {
    console.log('🔄 Loading initial application data...');
    try {
      // Check if backend is reachable first
      try {
        console.log('🔍 Testing backend connection at:', API_BASE_URL);
        const testResponse = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'include',
        });
        console.log('📡 Backend connection test:', testResponse.ok ? '✅ Connected' : '❌ Failed');
      } catch (connectionError) {
        console.warn('⚠ Backend connection test failed:', connectionError);
        console.log('⚠ Will still attempt to load data, but expect CORS issues');
      }
      
      // Load core data with Promise.all for efficiency
      console.log('📥 Fetching core application data...');
      const [projects, teams, notifications, users, templates] = await Promise.all([
        this.getProjects(),
        this.getTeams(),
        this.getNotifications(),
        this.getUsers(),
        this.getTemplates(),
      ]);

      console.log('💾 Updating application store with fetched data');
      // Update store with fetched data
      useStore.setState({
        projects,
        teams,
        notifications,
        users,
        templates,
      });

      // Load related data sequentially
      // Load villas for the first project if available
      if (projects.length > 0) {
        console.log(`📊 Loading villas for project: ${projects[0].name} (${projects[0].id})`);
        const villas = await this.getVillas(projects[0].id);
        useStore.setState({ villas });

        // Load categories for the first villa if available
        if (villas.length > 0) {
          console.log(`📊 Loading categories for villa: ${villas[0].name} (${villas[0].id})`);
          const categories = await this.getCategories(villas[0].id);
          useStore.setState({ categories });

          // Load tasks for the first category if available
          if (categories.length > 0) {
            console.log(`📊 Loading tasks for category: ${categories[0].name} (${categories[0].id})`);
            const tasks = await this.getTasks(categories[0].id);
            useStore.setState({ tasks });
          }
        }
      }
      console.log('✅ Initial data load completed successfully');
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for initial data load:', {
          origin: window.location.origin,
          targetApi: API_BASE_URL,
          browser: navigator.userAgent,
          time: new Date().toISOString()
        });
        console.log('💡 Suggestions to fix CORS issues:');
        console.log('  1. Ensure backend server is running at', API_BASE_URL);
        console.log('  2. Check CorsConfig.java to allow origin:', window.location.origin);
        console.log('  3. Verify backend has proper CORS headers in responses');
        console.log('  4. Try restarting both frontend and backend servers');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService();