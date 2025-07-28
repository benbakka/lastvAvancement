import { create } from 'zustand';
import { Project, Villa, Category, Team, Task, TaskTemplate, Notification, User, Template } from './types';

interface AppState {
  // Current selections
  selectedProject: Project | null;
  selectedVilla: Villa | null;
  
  // Data
  projects: Project[];
  villas: Villa[];
  categories: Category[];
  teams: Team[];
  tasks: Task[];
  notifications: Notification[];
  users: User[];
  templates: Template[];
  taskTemplates: TaskTemplate[];
  
  // UI state
  sidebarOpen: boolean;
  loading: boolean;
  
  // Actions
  setSelectedProject: (project: Project | null) => void;
  setSelectedVilla: (villa: Villa | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  setTasks: (tasks: Task[]) => void;
  
  // Data actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addVilla: (villa: Villa) => void;
  updateVilla: (id: string, updates: Partial<Villa>) => void;
  deleteVilla: (id: string) => void;
  
  addTeam: (team: Team) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  
  // Task Templates
  addTaskTemplate: (template: TaskTemplate) => void;
  updateTaskTemplate: (id: string, updates: Partial<TaskTemplate>) => void;
  deleteTaskTemplate: (id: string) => void;
  
  // User management
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Computed
  getVillasByProject: (projectId: string) => Villa[];
  getCategoriesByVilla: (villaId: string) => Category[];
  getTasksByCategory: (categoryId: string) => Task[];
  getUnreadNotifications: () => Notification[];
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  selectedProject: null,
  selectedVilla: null,
  projects: [],
  villas: [],
  categories: [],
  teams: [],
  tasks: [],
  notifications: [],
  users: [],
  templates: [],
  taskTemplates: [],
  sidebarOpen: true,
  loading: false,
  
  // Actions
  setSelectedProject: (project) => set({ selectedProject: project }),
  setSelectedVilla: (villa) => set({ selectedVilla: villa }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ loading }),
  setTasks: (tasks) => set({ tasks }),
  
  // Data actions
  addProject: (project) => set((state) => {
    // Check if project with same ID already exists
    const exists = state.projects.some(p => p.id === project.id);
    if (exists) {
      // If project already exists, don't add it again
      return { projects: state.projects };
    }
    // Otherwise add the project
    return { projects: [...state.projects, project] };
  }),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),
  
  addVilla: (villa) => set((state) => ({
    villas: [...state.villas, villa]
  })),
  
  updateVilla: (id, updates) => set((state) => ({
    villas: state.villas.map(v => v.id === id ? { ...v, ...updates } : v)
  })),
  
  deleteVilla: (id) => set((state) => ({
    villas: state.villas.filter(v => v.id !== id)
  })),
  
  addTeam: (team) => set((state) => ({
    teams: [...state.teams, team]
  })),
  
  updateTeam: (id, updates) => set((state) => ({
    teams: state.teams.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTeam: (id) => set((state) => ({
    teams: state.teams.filter(t => t.id !== id)
  })),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  
  addCategory: (category) => set((state) => ({
    categories: [...state.categories, category]
  })),
  
  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(c => c.id !== id)
  })),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
  })),
  
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id)
  })),
  
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, template]
  })),
  
  updateTemplate: (id, updates) => set((state) => ({
    templates: state.templates.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id)
  })),
  
  // Task Template actions
  addTaskTemplate: (template) => set((state) => ({
    taskTemplates: [...state.taskTemplates, template]
  })),
  
  updateTaskTemplate: (id, updates) => set((state) => ({
    taskTemplates: state.taskTemplates.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  deleteTaskTemplate: (id) => set((state) => ({
    taskTemplates: state.taskTemplates.filter(t => t.id !== id)
  })),
  
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    )
  })),
  
  clearAllNotifications: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  
  // Computed
  getVillasByProject: (projectId) => {
    console.log('Filtering villas for projectId:', projectId);
    console.log('Available villas count:', get().villas.length);
    
    // Ensure projectId is a string for consistent comparison
    const targetProjectId = projectId?.toString() || '';
    console.log('Target project ID (normalized):', targetProjectId);
    
    // Enhanced debugging for villa filtering
    const filteredVillas = get().villas.filter(villa => {
      // Ensure villa.projectId is a string
      const villaProjectId = villa.projectId?.toString() || '';
      
      // Log detailed comparison for debugging
      const isMatch = villaProjectId === targetProjectId;
      console.log(`Villa ${villa.id} (${villa.name}) - projectId: "${villaProjectId}" vs target: "${targetProjectId}" - Match: ${isMatch}`);
      
      return isMatch;
    });
    
    console.log(`Found ${filteredVillas.length} villas for project ${targetProjectId}`);
    return filteredVillas;
  },
  
  getCategoriesByVilla: (villaId) => {
    console.log('Filtering categories for villaId:', villaId);
    console.log('Available categories count:', get().categories.length);
    
    // Ensure villaId is a string for consistent comparison
    const targetVillaId = villaId?.toString() || '';
    
    // Enhanced debugging for category filtering
    const filteredCategories = get().categories.filter(category => {
      // Ensure category.villaId is a string
      const categoryVillaId = category.villaId?.toString() || '';
      
      // Log detailed comparison for debugging
      const isMatch = categoryVillaId === targetVillaId;
      console.log(`Category ${category.id} (${category.name}) - villaId: "${categoryVillaId}" vs target: "${targetVillaId}" - Match: ${isMatch}`);
      
      return isMatch;
    });
    
    console.log(`Found ${filteredCategories.length} categories for villa ${targetVillaId}`);
    return filteredCategories;
  },
  
  getTasksByCategory: (categoryId) => {
    return get().tasks.filter(t => t.categoryId === categoryId);
  },
  
  getUnreadNotifications: () => {
    return get().notifications.filter(n => !n.isRead);
  },
}));