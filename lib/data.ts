import { Project, Villa, Category, Team, Task, Notification, User, Template } from './types';

// Initialize with some sample data for development
export const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Résidence Les Oliviers',
    type: 'Résidentiel',
    location: 'Casablanca',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    status: 'active',
    progress: 65,
    villasCount: 12,
    alertsCount: 3,
  },
  {
    id: '2',
    name: 'Complexe Al Manar',
    type: 'Commercial',
    location: 'Rabat',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-06-30'),
    status: 'active',
    progress: 35,
    villasCount: 8,
    alertsCount: 1,
  },
];

export const initialVillas: Villa[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Villa A1',
    type: 'Villa Type A',
    surface: 250,
    progress: 75,
    status: 'in_progress',
    categoriesCount: 8,
    tasksCount: 32,
    lastModified: new Date('2024-01-20'),
  },
  {
    id: '2',
    projectId: '1',
    name: 'Villa A2',
    type: 'Villa Type A',
    surface: 250,
    progress: 45,
    status: 'delayed',
    categoriesCount: 8,
    tasksCount: 32,
    lastModified: new Date('2024-01-18'),
  },
  {
    id: '3',
    projectId: '1',
    name: 'Villa B1',
    type: 'Villa Type B',
    surface: 180,
    progress: 90,
    status: 'in_progress',
    categoriesCount: 6,
    tasksCount: 24,
    lastModified: new Date('2024-01-22'),
  },
];

export const initialCategories: Category[] = [
  {
    id: '1',
    villaId: '1',
    name: 'Gros Œuvre',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-03-15'),
    progress: 100,
    status: 'on_schedule',
    teamId: '1',
    tasksCount: 6,
    completedTasks: 6,
  },
  {
    id: '2',
    villaId: '1',
    name: 'Plomberie',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-04-30'),
    progress: 60,
    status: 'in_progress',
    teamId: '2',
    tasksCount: 4,
    completedTasks: 2,
  },
  {
    id: '3',
    villaId: '1',
    name: 'Électricité',
    startDate: new Date('2024-03-15'),
    endDate: new Date('2024-05-15'),
    progress: 40,
    status: 'warning',
    teamId: '3',
    tasksCount: 5,
    completedTasks: 2,
  },
];

export const initialTeams: Team[] = [
  {
    id: '1',
    name: 'Équipe Maçonnerie',
    specialty: 'Gros Œuvre',
    membersCount: 6,
    activeTasks: 2,
    performance: 85,
    lastActivity: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Équipe Plomberie',
    specialty: 'Plomberie',
    membersCount: 3,
    activeTasks: 4,
    performance: 78,
    lastActivity: new Date('2024-01-21'),
  },
  {
    id: '3',
    name: 'Équipe Électricité',
    specialty: 'Électricité',
    membersCount: 4,
    activeTasks: 3,
    performance: 92,
    lastActivity: new Date('2024-01-22'),
  },
];

export const initialTasks: Task[] = [
  {
    id: '1',
    categoryId: '2',
    villaId: '1',
    name: 'Installation conduits principal',
    description: 'Installation des conduits principaux d\'évacuation',
    teamId: '2',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-15'),
    plannedStartDate: new Date('2024-03-01'),
    plannedEndDate: new Date('2024-03-15'),
    status: 'completed',
    progress: 100,
    progressStatus: 'on_schedule',
    isReceived: true,
    isPaid: true,
    amount: 15000,
    photos: [],
    remarks: 'Travail conforme aux normes',
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-03-16'),
  },
  {
    id: '2',
    categoryId: '2',
    villaId: '1',
    name: 'Raccordement sanitaires',
    description: 'Raccordement des équipements sanitaires',
    teamId: '2',
    startDate: new Date('2024-03-16'),
    endDate: new Date('2024-03-30'),
    plannedStartDate: new Date('2024-03-16'),
    plannedEndDate: new Date('2024-03-30'),
    status: 'in_progress',
    progress: 70,
    progressStatus: 'on_schedule',
    isReceived: false,
    isPaid: false,
    amount: 8000,
    photos: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '3',
    categoryId: '3',
    villaId: '1',
    name: 'Câblage électrique',
    description: 'Installation du câblage électrique principal',
    teamId: '3',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-04-10'),
    plannedStartDate: new Date('2024-03-15'),
    plannedEndDate: new Date('2024-04-05'),
    status: 'delayed',
    progress: 30,
    progressStatus: 'behind',
    isReceived: false,
    isPaid: false,
    amount: 12000,
    photos: [],
    remarks: 'Retard dû aux conditions météo',
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-25'),
  },
];

export const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'delay',
    title: 'Retard détecté',
    message: 'La tâche "Câblage électrique" accuse un retard de 3 jours',
    priority: 'high',
    isRead: false,
    createdAt: new Date('2024-01-22'),
    projectId: '1',
    villaId: '1',
    taskId: '3',
  },
  {
    id: '2',
    type: 'deadline',
    title: 'Deadline approche',
    message: 'La catégorie "Plomberie" se termine dans 2 jours',
    priority: 'medium',
    isRead: false,
    createdAt: new Date('2024-01-21'),
    projectId: '1',
    villaId: '1',
  },
  {
    id: '3',
    type: 'unreceived',
    title: 'Réception en attente',
    message: '1 tâche terminée en attente de réception depuis 5 jours',
    priority: 'medium',
    isRead: true,
    createdAt: new Date('2024-01-20'),
    projectId: '1',
    villaId: '1',
  },
];

export const initialUsers: User[] = [
  {
    id: '1',
    name: 'Ahmed Benali',
    email: 'ahmed.benali@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@example.com',
    role: 'team_leader',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '3',
    name: 'Mohamed Alami',
    email: 'mohamed.alami@example.com',
    role: 'worker',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    name: 'Khadija Bennani',
    email: 'khadija.bennani@example.com',
    role: 'team_leader',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '5',
    name: 'Youssef Tazi',
    email: 'youssef.tazi@example.com',
    role: 'worker',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '6',
    name: 'Aicha Idrissi',
    email: 'aicha.idrissi@example.com',
    role: 'worker',
    createdAt: new Date('2024-01-18'),
  }
];

export const initialTemplates: Template[] = [
  {
    id: '1',
    name: 'Villa Standard',
    description: 'Template pour villa résidentielle standard',
    categories: [
      {
        name: 'Gros Œuvre',
        teams: [
          {
            name: 'Équipe Maçonnerie',
            specialty: 'Gros Œuvre',
            tasks: ['Fondations', 'Maçonnerie', 'Charpente', 'Couverture']
          }
        ]
      },
      {
        name: 'Plomberie',
        teams: [
          {
            name: 'Équipe Plomberie',
            specialty: 'Plomberie',
            tasks: ['Conduits principaux', 'Raccordements', 'Sanitaires']
          }
        ]
      },
      {
        name: 'Électricité',
        teams: [
          {
            name: 'Équipe Électricité',
            specialty: 'Électricité',
            tasks: ['Câblage', 'Tableaux', 'Prises et interrupteurs']
          }
        ]
      },
      {
        name: 'Finitions',
        teams: [
          {
            name: 'Équipe Finitions',
            specialty: 'Finitions',
            tasks: ['Peinture', 'Carrelage', 'Menuiserie']
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Appartement',
    description: 'Template pour appartement standard',
    categories: [
      {
        name: 'Cloisons',
        teams: [
          {
            name: 'Équipe Cloisons',
            specialty: 'Cloisons',
            tasks: ['Cloisons sèches', 'Isolation phonique']
          }
        ]
      },
      {
        name: 'Plomberie',
        teams: [
          {
            name: 'Équipe Plomberie',
            specialty: 'Plomberie',
            tasks: ['Conduits', 'Sanitaires']
          }
        ]
      },
      {
        name: 'Électricité',
        teams: [
          {
            name: 'Équipe Électricité',
            specialty: 'Électricité',
            tasks: ['Câblage', 'Prises']
          }
        ]
      },
      {
        name: 'Finitions',
        teams: [
          {
            name: 'Équipe Finitions',
            specialty: 'Finitions',
            tasks: ['Peinture', 'Sols']
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-01'),
  },
];