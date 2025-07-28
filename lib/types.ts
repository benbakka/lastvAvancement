export interface Project {
  id: string;
  name: string;
  type: string;
  location: string;
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  progress: number;
  villasCount: number;
  alertsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Villa {
  id: string;
  projectId: string;
  name: string;
  type: string;
  surface: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  categoriesCount: number;
  tasksCount: number;
  lastModified: Date;
}

export interface Category {
  id: string;
  villaId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'ON_SCHEDULE' | 'IN_PROGRESS' | 'WARNING' | 'DELAYED';
  teamId?: string;
  tasksCount: number;
  completedTasks: number;
}

export interface Team {
  id: string;
  name: string;
  specialty: string;
  membersCount: number;
  activeTasks: number;
  performance: number;
  lastActivity: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  durationDays?: number;
  defaultAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  templateId?: string; // Reference to TaskTemplate
  categoryId: string;
  villaId: string;
  name: string;
  description?: string;
  teamId?: string;
  startDate: Date;
  endDate: Date;
  plannedStartDate: Date;
  plannedEndDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  progressStatus: 'on_schedule' | 'ahead' | 'behind' | 'at_risk';
  isReceived: boolean;
  isPaid: boolean;
  amount?: number;
  photos: string[];
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'deadline' | 'delay' | 'unreceived' | 'unpaid' | 'team_inactive';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  projectId?: string;
  villaId?: string;
  taskId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'team_leader' | 'worker';
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
  phone?: string;
  lastLogin?: Date;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  categories: {
    name: string;
    startDate?: string;
    endDate?: string;
    teams: {
      name: string;
      specialty: string;
      tasks: {
        name: string;
        description?: string;
        duration?: string;
        amount?: string;
        plannedStartDate?: string;
        plannedEndDate?: string;
        actualStartDate?: string;
        actualEndDate?: string;
        progress?: number;
        progressStatus?: 'on_schedule' | 'ahead' | 'behind' | 'at_risk';
        status?: 'pending' | 'in_progress' | 'completed' | 'delayed';
        isReceived?: boolean;
        isPaid?: boolean;
        remarks?: string;
      }[];
    }[];
  }[];
  createdAt: Date;
}