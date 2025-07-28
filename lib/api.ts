import { Project, Villa, Category, Team, Task, TaskTemplate, User, Template } from './types';
import type { Notification } from './types';
import { useStore } from './store';

// Connect directly to backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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
      // Create new options with merged headers to ensure Content-Type is set correctly
      const mergedOptions = { ...options };
      
      // Create headers object with default values
      mergedOptions.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // Merge with any headers provided in options
        ...(options?.headers || {})
      };
      
      // Enhanced fetch configuration with proper CORS settings
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'include', // Send cookies if needed
        ...mergedOptions
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
    try {
      const categories = await this.request<any[]>(endpoint);
      console.log(`✅ Retrieved ${categories.length} categories`);
      
      // Process the response to ensure proper type conversion for the frontend
      return categories.map(category => {
        // Debug the raw category data from backend
        console.log('Raw category from backend:', JSON.stringify(category));
        
        // Extract villaId with better error handling
        let extractedVillaId = '';
        if (category.villaId) {
          // Direct villaId property (if present)
          extractedVillaId = category.villaId.toString();
          console.log(`Category ${category.id} has direct villaId: ${extractedVillaId}`);
        } else if (category.villa && category.villa.id) {
          // Nested villa object
          extractedVillaId = category.villa.id.toString();
          console.log(`Category ${category.id} has nested villa.id: ${extractedVillaId}`);
        } else if (villaId) {
          // Fallback to parameter
          extractedVillaId = villaId;
          console.log(`Category ${category.id} using parameter villaId: ${extractedVillaId}`);
        }
        
        const mappedCategory = {
          id: category.id ? category.id.toString() : `temp-${Date.now()}`,
          villaId: extractedVillaId,
          name: category.name || '',
          startDate: new Date(category.startDate),
          endDate: new Date(category.endDate),
          progress: category.progress || 0,
          status: category.status || 'ON_SCHEDULE',
          teamId: category.team?.id?.toString() || undefined,
          tasksCount: category.tasksCount || 0,
          completedTasks: category.completedTasks || 0
        };
        
        console.log(`Mapped category ${mappedCategory.id} (${mappedCategory.name}) with villaId: ${mappedCategory.villaId}`);
        return mappedCategory;
      });
    } catch (error) {
      console.error('❌ Failed to fetch categories:', error);
      throw error;
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}`);
  }

  async getCategoriesByVillaId(villaId: string): Promise<Category[]> {
    console.log(`🔍 Fetching categories for villa ID: ${villaId}`);
    try {
      // Use the correct endpoint with query parameter as implemented in the backend
      const categories = await this.request<any[]>(`/categories?villaId=${villaId}`);
      console.log(`✅ Found ${categories.length} categories for villa ${villaId}`);
      
      // Process the response to ensure proper type conversion for the frontend
      // and explicitly set the villaId property for each category
      return categories.map(category => ({
        id: category.id ? category.id.toString() : `temp-${Date.now()}`,
        // Always set the villaId to the one we're querying for
        villaId: villaId,
        name: category.name || '',
        startDate: new Date(category.startDate),
        endDate: new Date(category.endDate),
        progress: category.progress || 0,
        status: category.status || 'ON_SCHEDULE',
        teamId: category.team?.id?.toString() || undefined,
        tasksCount: category.tasksCount || 0,
        completedTasks: category.completedTasks || 0
      }));
    } catch (error) {
      console.error(`❌ Error fetching categories for villa ${villaId}:`, error);
      throw error;
    }
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    console.log(`📝 Creating new category:`, category);
    try {
      const response = await this.request<Category>('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
      console.log(`✅ Category created successfully:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error creating category:`, error);
      throw error;
    }
  }

  async createCategoryWithVilla(categoryDTO: { villaId: string; name: string; startDate: Date | string; endDate: Date | string; teamId?: string }): Promise<Category> {
    console.log(`📝 Creating new category with villa:`, categoryDTO);
    try {
      // Format dates to yyyy-MM-dd format as expected by backend
      const formattedDTO = {
        ...categoryDTO,
        villaId: parseInt(categoryDTO.villaId), // Convert string ID to number for backend
        startDate: categoryDTO.startDate instanceof Date 
          ? categoryDTO.startDate.toISOString().split('T')[0] 
          : categoryDTO.startDate,
        endDate: categoryDTO.endDate instanceof Date 
          ? categoryDTO.endDate.toISOString().split('T')[0] 
          : categoryDTO.endDate,
        teamId: categoryDTO.teamId ? parseInt(categoryDTO.teamId) : undefined // Convert string ID to number if present
      };
      
      console.log('Sending formatted category DTO to backend:', formattedDTO);
      
      const response = await this.request<any>('/categories/villa', {
        method: 'POST',
        body: JSON.stringify(formattedDTO),
      });
      console.log(`✅ Category created successfully with villa:`, response);
      
      // Process the response to ensure proper type conversion for the frontend
      // and explicitly set the villaId property
      return {
        id: response.id ? response.id.toString() : `temp-${Date.now()}`,
        // Explicitly set the villaId from the DTO
        villaId: categoryDTO.villaId,
        name: response.name || categoryDTO.name,
        startDate: new Date(response.startDate || categoryDTO.startDate),
        endDate: new Date(response.endDate || categoryDTO.endDate),
        progress: response.progress || 0,
        status: response.status || 'ON_SCHEDULE',
        teamId: response.team?.id?.toString() || categoryDTO.teamId,
        tasksCount: response.tasksCount || 0,
        completedTasks: response.completedTasks || 0
      };
    } catch (error) {
      console.error(`❌ Error creating category with villa:`, error);
      throw error;
    }
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
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
  
  async createTeamWithDefaultTasks(team: Omit<Team, 'id'>, defaultTasks: Array<{ name: string; description: string; durationDays: number; defaultAmount: number; }>): Promise<Team> {
    try {
      console.log('🏗️ Creating team with default tasks:', { team, defaultTasks });
      
      // Prepare the data for the backend
      const backendData = {
        team: {
          ...team,
          // Convert string ID to null so backend can generate a proper ID
          id: null,
          // Convert date to ISO string if it exists
          lastActivity: team.lastActivity ? team.lastActivity.toISOString() : null
        },
        defaultTasks: defaultTasks.map(task => ({
          name: task.name,
          description: task.description,
          durationDays: task.durationDays,
          defaultAmount: task.defaultAmount
        }))
      };
      
      console.log('Sending team with tasks data to backend:', backendData);
      
      // Use the new API endpoint for team with default tasks
      const response = await this.request<any>('/teams/with-default-tasks', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
      
      console.log('✅ Team with default tasks created successfully:', response);
      
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
      console.error('❌ Failed to create team with default tasks:', error);
      if (error instanceof Error && error.message.includes('CORS')) {
        console.error('🔍 CORS Debugging Info for create team with tasks:', {
          origin: window.location.origin,
          targetApi: `${API_BASE_URL}/teams/with-default-tasks`,
          requestMethod: 'POST',
          browser: navigator.userAgent
        });
      }
      throw error;
    }
  }

  // Task Templates - Implementation moved to the Task Templates section below

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
    console.log(`🔍 Fetching tasks with endpoint: ${endpoint}`);
    return this.request<Task[]>(endpoint);
  }
  
  async getTasksByTeamId(teamId: string): Promise<Task[]> {
    console.log(`🔍 Fetching tasks for team ID: ${teamId}`);
    try {
      const tasks = await this.request<Task[]>(`/tasks/team/${teamId}`);
      console.log(`🔍 Retrieved ${tasks.length} tasks for team ID: ${teamId}`, tasks);
      return tasks;
    } catch (error) {
      console.error(`❌ Error fetching tasks for team ID: ${teamId}`, error);
      throw error;
    }
  }
  
  async getTasksByCategoryAndVilla(categoryId: string, villaId: string): Promise<Task[]> {
    console.log(`🔍 Fetching tasks for category ID: ${categoryId} and villa ID: ${villaId}`);
    try {
      // Validate inputs
      if (!categoryId || !villaId) {
        console.error(`❌ Missing required parameters: categoryId=${categoryId}, villaId=${villaId}`);
        return [];
      }
      
      const numericCategoryId = Number(categoryId);
      const numericVillaId = Number(villaId);
      
      if (isNaN(numericCategoryId) || isNaN(numericVillaId)) {
        console.error(`❌ Invalid IDs: categoryId=${categoryId}, villaId=${villaId}`);
        return [];
      }
      
      // Make API request with detailed error handling
      try {
        const tasks = await this.request<Task[]>(`/tasks/category/${numericCategoryId}/villa/${numericVillaId}`);
        console.log(`✅ Retrieved ${tasks.length} tasks for category ${categoryId} and villa ${villaId}`, tasks);
        return tasks;
      } catch (apiError: any) {
        // Handle specific API errors
        if (apiError.status === 404) {
          console.error(`❌ Category or villa not found: categoryId=${categoryId}, villaId=${villaId}`);
          return [];
        } else if (apiError.status === 500) {
          console.error(`❌ Server error when fetching tasks: ${apiError.message}`);
          return [];
        } else {
          console.error(`❌ API error: ${apiError.message}`);
          return [];
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching tasks for category ${categoryId} and villa ${villaId}:`, error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
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

  // Bypass circular references in JSON for task updates
  private createMinimalTaskUpdatePayload(task: Partial<Task>): any {
    const backendTask: any = {};
      
    // Only include fields that are actually being updated
    if (task.name !== undefined) backendTask.name = task.name;
    if (task.description !== undefined) backendTask.description = task.description;
    if (task.amount !== undefined) backendTask.amount = task.amount;
    if (task.progress !== undefined) backendTask.progress = task.progress;
    if (task.progressStatus !== undefined) backendTask.progressStatus = task.progressStatus.toUpperCase();
    if (task.isReceived !== undefined) backendTask.isReceived = task.isReceived;
    if (task.isPaid !== undefined) backendTask.isPaid = task.isPaid;
    
    // Handle dates - convert to string format expected by backend
    if (task.startDate) {
      backendTask.startDate = task.startDate instanceof Date ? 
        task.startDate.toISOString().split('T')[0] : task.startDate;
    }
    
    if (task.endDate) {
      backendTask.endDate = task.endDate instanceof Date ? 
        task.endDate.toISOString().split('T')[0] : task.endDate;
    }
    
    if (task.plannedStartDate) {
      backendTask.plannedStartDate = task.plannedStartDate instanceof Date ? 
        task.plannedStartDate.toISOString().split('T')[0] : task.plannedStartDate;
    }
    
    if (task.plannedEndDate) {
      backendTask.plannedEndDate = task.plannedEndDate instanceof Date ? 
        task.plannedEndDate.toISOString().split('T')[0] : task.plannedEndDate;
    }
    
    // Handle relationships - only include ID references, not full objects
    if (task.teamId) {
      backendTask.teamId = Number(task.teamId);
    }
    
    if (task.categoryId) {
      backendTask.categoryId = Number(task.categoryId);
    }
    
    if (task.villaId) {
      backendTask.villaId = Number(task.villaId);
    }
    
    return backendTask;
  }
  
  // Direct request without fetch to avoid charset in content-type
  private makeRawAjaxRequest<T>(url: string, method: string, data: any): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Create an XMLHttpRequest object
      const xhr = new XMLHttpRequest();
      
      // Initialize a request
      xhr.open(method, url, true);
      
      // Set headers exactly as needed without auto-additions
      // Setting Content-Type header WITHOUT charset
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      // Enable cookies/credentials
      xhr.withCredentials = true;
      
      // Log request details
      console.log(`Making raw ${method} request to ${url}`);
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      
      // Define what happens on successful data submission
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`XHR response received with status ${xhr.status}`);
          try {
            const response = xhr.responseText ? JSON.parse(xhr.responseText) : null;
            resolve(response as T);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${e}`));
          }
        } else {
          console.error(`XHR request failed with status ${xhr.status}: ${xhr.statusText}`);
          console.error('Response text:', xhr.responseText);
          reject(new Error(`Request failed with status ${xhr.status}`));
        }
      };
      
      // Define what happens in case of error
      xhr.onerror = function() {
        console.error('XHR request failed');
        reject(new Error('Network error occurred'));
      };
      
      // Send the request with data
      xhr.send(data ? JSON.stringify(data) : null);
      console.log(`XHR ${method} request sent with payload:`, data);
    });
  }

  // Attempt 1: Custom XMLHttpRequest without charset
  // Ultra-minimal task update to avoid Jackson deserialization issues
  async updateTaskFinal(id: string, task: Partial<Task>): Promise<Task> {
    try {
      console.log(`🔄 Final approach: Updating task ${id} with minimal data`);      
      const numericId = Number(id);
      
      if (isNaN(numericId)) {
        throw new Error(`Invalid task ID: ${id}`);
      }
      
      // Create a completely flat, minimal task with ONLY primitive values
      const minimalTask: Record<string, any> = {};
      
      // Only add fields that are explicitly in the update request
      if (task.name !== undefined) minimalTask.name = task.name;
      if (task.description !== undefined) minimalTask.description = task.description;
      if (task.amount !== undefined) minimalTask.amount = task.amount;
      if (task.progress !== undefined) minimalTask.progress = task.progress;
      if (task.isReceived !== undefined) minimalTask.isReceived = task.isReceived;
      if (task.isPaid !== undefined) minimalTask.isPaid = task.isPaid;
      if (task.remarks !== undefined) minimalTask.remarks = task.remarks;
      
      // Convert enum to string and ensure uppercase
      if (task.progressStatus !== undefined) {
        minimalTask.progressStatus = String(task.progressStatus).toUpperCase();
      }
      
      if (task.status !== undefined) {
        minimalTask.status = String(task.status).toUpperCase();
      }
      
      // Format dates as strings in YYYY-MM-DD format
      if (task.startDate) {
        minimalTask.startDate = task.startDate instanceof Date ? 
          task.startDate.toISOString().split('T')[0] : task.startDate;
      }
      
      if (task.endDate) {
        minimalTask.endDate = task.endDate instanceof Date ? 
          task.endDate.toISOString().split('T')[0] : task.endDate;
      }
      
      if (task.plannedStartDate) {
        minimalTask.plannedStartDate = task.plannedStartDate instanceof Date ? 
          task.plannedStartDate.toISOString().split('T')[0] : task.plannedStartDate;
      }
      
      if (task.plannedEndDate) {
        minimalTask.plannedEndDate = task.plannedEndDate instanceof Date ? 
          task.plannedEndDate.toISOString().split('T')[0] : task.plannedEndDate;
      }
      
      // Handle relationships by sending as objects with id property
      if (task.teamId) {
        minimalTask.team = { id: Number(task.teamId) };
      }
      
      if (task.categoryId) {
        minimalTask.category = { id: Number(task.categoryId) };
      }
      
      if (task.villaId) {
        minimalTask.villa = { id: Number(task.villaId) };
      }
      
      const apiEndpoint = `/tasks/${numericId}`;
      const url = `${API_BASE_URL}/api${apiEndpoint}`;
      
      console.log('Attempting task update with multiple approaches');
      console.log('Minimal task payload:', minimalTask);
      
      // Try multiple approaches in sequence until one works
      
      // Attempt 1: Using XMLHttpRequest with precise Content-Type control
      try {
        console.log('Attempt 1: Using XMLHttpRequest with precise Content-Type');
        const result = await new Promise<Task>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', url, true);
          
          // Set headers - CRITICAL: Do not add charset to Content-Type
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.withCredentials = true;
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('Task update successful with status:', xhr.status);
              try {
                const data = JSON.parse(xhr.responseText) as Task;
                resolve(data);
              } catch (e) {
                reject(new Error(`Failed to parse response: ${e}`));
              }
            } else {
              console.error('XHR failed with status:', xhr.status);
              console.error('Response:', xhr.responseText);
              reject(new Error(`Task update failed with status ${xhr.status}`));
            }
          };
          
          xhr.onerror = function() {
            console.error('Network error during task update');
            reject(new Error('Network error occurred'));
          };
          
          // Stringify with no spaces for minimal payload
          const jsonStr = JSON.stringify(minimalTask);
          console.log('JSON payload being sent:', jsonStr);
          xhr.send(jsonStr);
        });
        
        return result;
      } catch (xhrError) {
        console.log('XMLHttpRequest approach failed:', xhrError);
        // Continue to next approach
      }
      
      // Attempt 2: Using fetch with explicit headers
      try {
        console.log('Attempt 2: Using fetch with explicit headers');
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify(minimalTask),
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.error(`Fetch failed with status: ${response.status}`);
          throw new Error(`Task update failed with status ${response.status}`);
        }
        
        const data = await response.json() as Task;
        console.log('Task update successful with fetch:', data);
        return data;
      } catch (fetchError) {
        console.log('Fetch approach failed:', fetchError);
        // Continue to next approach
      }
      
      // Attempt 3: Using POST with method override
      try {
        console.log('Attempt 3: Using POST with method override');
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
        
        if (!response.ok) {
          console.error(`POST override failed with status: ${response.status}`);
          throw new Error(`Task update failed with status ${response.status}`);
        }
        
        const data = await response.json() as Task;
        console.log('Task update successful with POST override:', data);
        return data;
      } catch (postError) {
        console.log('POST override approach failed:', postError);
        throw new Error('All update approaches failed');
      }
    } catch (error) {
      console.error(`❌ Final approach failed for task ${id}:`, error);
      throw error;
    }
  }
  
  // Test function to directly update a task with curl-like approach
  async testDirectTaskUpdate(id: number): Promise<void> {
    try {
      console.log(`Testing direct task update for ID ${id}`);
      
      // Minimal task data with only the fields we want to update
      const minimalTask = {
        name: "Updated Task Name",
        description: "Updated description",
        progress: 50,
        progressStatus: "ON_SCHEDULE"
      };
      
      const url = `${API_BASE_URL}/api/tasks/${id}`;
      console.log(`Making direct request to ${url}`);
      
      // Create a native fetch request with very specific headers
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
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Test update failed:', error);
    }
  }

  // Main updateTask method using our final approach
  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    console.log(`🔄 Updating task ${id}:`, task);
    
    try {
      // Use the final approach that addresses Jackson circular references and content-type issues
      return await this.updateTaskFinal(id, task);
    } catch (error) {
      console.error('Task update failed:', error);
      throw error; // Re-throw to allow handling in the component
    }
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

  // Task Templates
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    return this.request<TaskTemplate[]>('/task-templates');
  }
  
   // Task Templates
   async getTaskTemplatesByTeamId(teamId: string): Promise<TaskTemplate[]> {
    try {
      const templates = await this.request<TaskTemplate[]>(`/task-templates/team/${teamId}`);
      return templates;
    } catch (error) {
      return [];
    }
  }
 

  async getTaskTemplateById(id: string): Promise<TaskTemplate> {
    return this.request<TaskTemplate>(`/task-templates/${id}`);
  }

  async createTaskTemplate(template: Omit<TaskTemplate, 'id'>): Promise<TaskTemplate> {
    return this.request<TaskTemplate>('/task-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async updateTaskTemplate(id: string, updates: Partial<TaskTemplate>): Promise<TaskTemplate> {
    return this.request<TaskTemplate>(`/task-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTaskTemplate(id: string): Promise<void> {
    return this.request<void>(`/task-templates/${id}`, {
      method: 'DELETE',
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
      
      // Load all data in parallel for better performance
      const [projects, teams, templates, taskTemplates] = await Promise.all([
        this.getProjects(),
        this.getTeams(),
        this.getTemplates(),
        this.getTaskTemplates()
      ]);
      
      // Update the store with the loaded data
      const store = useStore.getState();
      
      // Set projects
      projects.forEach(project => store.addProject(project));
      console.log(`✅ Loaded ${projects.length} projects`);
      
      // Set teams
      teams.forEach(team => store.addTeam(team));
      console.log(`✅ Loaded ${teams.length} teams`);
      
      // Set templates
      templates.forEach(template => store.addTemplate(template));
      console.log(`✅ Loaded ${templates.length} templates`);
      
      // Set task templates
      taskTemplates.forEach(template => store.addTaskTemplate(template));
      console.log(`✅ Loaded ${taskTemplates.length} task templates`);
      
      // If there are projects, load villas for the first project
      if (projects.length > 0) {
        const firstProject = projects[0];
        store.setSelectedProject(firstProject);
        
        // Load villas for the selected project
        const villas = await this.getVillas(firstProject.id);
        villas.forEach(villa => store.addVilla(villa));
        console.log(`✅ Loaded ${villas.length} villas for project ${firstProject.id}`);
        
        // If there are villas, set the first one as selected
        if (villas.length > 0) {
          const firstVilla = villas[0];
          store.setSelectedVilla(firstVilla);
          
          // Load ALL categories (not just for the first villa)
          // This ensures we have categories for all villas
          const allCategories = await this.getCategories();
          console.log(`✅ Loaded ${allCategories.length} total categories`);
          
          // Debug categories before adding to store
          allCategories.forEach(category => {
            console.log(`Category ${category.id} (${category.name}) has villaId: ${category.villaId}`);
            store.addCategory(category);
          });
          
          // Load tasks for all categories
          if (allCategories.length > 0) {
            console.log(`📊 Loading tasks for all categories`);
            let allTasks: Task[] = [];
            
            // Load tasks for a sample of categories (to avoid too many requests)
            const categoriesToLoad = allCategories.slice(0, Math.min(5, allCategories.length));
            
            for (const category of categoriesToLoad) {
              try {
                console.log(`📊 Loading tasks for category: ${category.name} (${category.id})`);
                const categoryTasks = await this.getTasks(category.id);
                allTasks = [...allTasks, ...categoryTasks];
              } catch (error) {
                console.error(`❌ Error loading tasks for category ${category.id}:`, error);
              }
            }
            
            console.log(`💾 Updating store with ${allTasks.length} total tasks`);
            useStore.setState({ tasks: allTasks });
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