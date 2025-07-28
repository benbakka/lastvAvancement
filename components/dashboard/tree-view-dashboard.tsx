'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { apiService } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Building2, 
  Wrench, 
  Users, 
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Camera,
  MessageSquare,
  Edit,
  Trash2,
  Eye,
  FileText
} from 'lucide-react';
import { StatsCards } from './stats-cards';
import { ProjectOverview } from './project-overview';
import { RecentActivity } from './recent-activity';
import { AIAssistant } from './ai-assistant';
import { Project, Villa, Category, Team, Task, TaskTemplate } from "@/lib/types";
import { applyTemplateToCategory, filterTasksByTeam } from '@/lib/template-utils';
import { toast } from '@/hooks/use-toast';

export function TreeViewDashboard() {
  const { 
    selectedProject, 
    getVillasByProject, 
    getCategoriesByVilla, 
    getTasksByCategory,
    teams,
    templates,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    setLoading
  } = useStore();

  const [openVillas, setOpenVillas] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [openTasks, setOpenTasks] = useState<Set<string>>(new Set());
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedVillaId, setSelectedVillaId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // Add state for category dialogs
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  // Team assignment dialog state (kept for compatibility but always false)
  const [isAssignTeamDialogOpen, setIsAssignTeamDialogOpen] = useState(false);
  const [currentVillaId, setCurrentVillaId] = useState<string>('');
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');
  
  // Form data for categories
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  
  // Team assignment data (kept for compatibility but not used)
  const [teamAssignmentData, setTeamAssignmentData] = useState({
    teamId: '',
    categoryId: ''
  });
  
  const [teamTaskTemplates, setTeamTaskTemplates] = useState<TaskTemplate[]>([]);
  
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    teamId: '',
    duration: '',
    amount: '',
    plannedStartDate: '',
    plannedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    progress: 0,
    progressStatus: 'on_schedule' as 'on_schedule' | 'ahead' | 'behind' | 'at_risk',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'delayed',
    isReceived: false,
    isPaid: false
  });

  // Fetch task templates when a team is selected
  const fetchTaskTemplatesByTeamId = async (teamId: string) => {
    console.log('🔍 Fetching task templates for team ID:', teamId);
    if (!teamId || teamId === 'all') {
      console.log('❌ Invalid team ID, clearing templates');
      setTeamTaskTemplates([]);
      return;
    }
    
    try {
      console.log('🔄 Calling API to get task templates...');
      const templates = await apiService.getTaskTemplatesByTeamId(teamId);
      console.log('✅ Received templates:', templates);
      setTeamTaskTemplates(templates);
      console.log('📊 Current teamTaskTemplates state after update:', templates.length);
    } catch (error) {
      console.error('❌ Error fetching task templates:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les tâches par défaut pour cette équipe',
        variant: 'destructive'
      });
    }
  };
  
  // Handle team selection in task form
  const handleTaskTeamChange = (teamId: string) => {
    console.log('📝 Team selected in task form:', teamId);
    
    // Update form state with selected team
    setTaskFormData(prev => ({
      ...prev,
      teamId: teamId,
      // Reset name when team changes
      name: ''
    }));
    
    // Fetch task templates for the selected team
    if (teamId) {
      fetchTaskTemplatesByTeamId(teamId);
    } else {
      setTeamTaskTemplates([]);
    }
  };

  useEffect(() => {
    const newTeamId = selectedTeamId === 'all' ? '' : (selectedTeamId || '');
    
    setTaskFormData(prev => ({
      ...prev,
      teamId: newTeamId,
      // Reset name when team changes
      name: ''
    }));
    
    if (newTeamId) {
      fetchTaskTemplatesByTeamId(newTeamId);
    } else {
      setTeamTaskTemplates([]);
    }
  }, [selectedTeamId]);

  // Dummy function for team assignment (kept for compatibility but not used)
  const handleSaveTeamAssignment = () => {
    // No-op function as team assignment at category level is removed
    setIsAssignTeamDialogOpen(false);
  };

  // Get tasks filtered by team if a team is selected
  const getCategoryTasks = (categoryId: string) => {
    const tasks = getTasksByCategory(categoryId);
    
    // If a team is selected and it's not 'all', filter tasks by team
    if (selectedTeamId && selectedTeamId !== 'all') {
      return tasks.filter(task => task.teamId === selectedTeamId);
    }
    
    return tasks;
  };
  
  const projectVillas = selectedProject ? getVillasByProject(selectedProject.id) : [];
  
  // Debug villa categories
  useEffect(() => {
    if (projectVillas.length > 0) {
      console.log('🔍 DEBUG: Project villas count:', projectVillas.length);
      projectVillas.forEach(villa => {
        const villaCategories = getCategoriesByVilla(villa.id);
        console.log(`🔍 DEBUG: Villa ${villa.id} (${villa.name}) has ${villaCategories.length} categories`);
        if (villaCategories.length > 0) {
          console.log('  Categories found:', villaCategories.map(c => `${c.id}: ${c.name}`));
        }
      });
    }
  }, [projectVillas, getCategoriesByVilla]);
  
  // Auto-update progress statuses when dashboard loads
  useEffect(() => {
    if (projectVillas.length > 0) {
      // Update all task progress statuses based on their planned dates and current progress
      updateAllTaskProgressStatuses();
      console.log('✅ Updated all task progress statuses automatically');
    }
  }, [projectVillas]);
  
  // Function to toggle task expansion
  const toggleTask = (taskId: string) => {
    const newOpenTasks = new Set(openTasks);
    if (newOpenTasks.has(taskId)) {
      newOpenTasks.delete(taskId);
    } else {
      newOpenTasks.add(taskId);
    }
    setOpenTasks(newOpenTasks);
  };

  const toggleVilla = (villaId: string) => {
    const newOpenVillas = new Set(openVillas);
    if (newOpenVillas.has(villaId)) {
      newOpenVillas.delete(villaId);
    } else {
      newOpenVillas.add(villaId);
    }
    setOpenVillas(newOpenVillas);
  };

  const toggleCategory = async (categoryId: string) => {
    const newOpenCategories = new Set(openCategories);
    
    // If we're opening the category, fetch tasks from backend
    if (!newOpenCategories.has(categoryId)) {
      newOpenCategories.add(categoryId);
      
      try {
        // Find the villa that this category belongs to
        // Use the getCategoriesByVilla function from the store to find all categories
        // and then filter to find the specific category
        const allCategories = projectVillas.flatMap(villa => getCategoriesByVilla(villa.id));
        const category = allCategories.find(c => c.id === categoryId);
        
        if (!category) {
          console.error(`❌ Category with ID ${categoryId} not found`);
          setOpenCategories(newOpenCategories); // Still open the category even if we can't fetch tasks
          return;
        }
        
        const villaId = category.villaId;
        if (!villaId) {
          console.error(`❌ Category ${categoryId} does not have a valid villaId`);
          setOpenCategories(newOpenCategories); // Still open the category even if we can't fetch tasks
          return;
        }
        
        console.log(`🔍 Fetching tasks for category ID: ${categoryId} and villa ID: ${villaId} from backend`);
        
        const { apiService } = await import('@/lib/api');
        
        // Show loading state if needed
        const { setLoading } = useStore.getState();
        setLoading(true);
        
        try {
          // Use the new method to fetch tasks by both category and villa
          const backendTasks = await apiService.getTasksByCategoryAndVilla(categoryId, villaId);
          
          // Update tasks in the store with the fetched tasks
          const { setTasks } = useStore.getState();
          
          if (backendTasks && backendTasks.length > 0) {
            console.log(`✅ Retrieved ${backendTasks.length} tasks for category ${categoryId} and villa ${villaId} from backend`);
            
            // Convert backend tasks to frontend task format if needed
            const frontendTasks = backendTasks.map(task => {
              // Create a properly typed Task object
              const frontendTask: Task = {
                id: task.id.toString(),
                categoryId: categoryId,
                villaId: villaId, // Use the villaId from the category, not from the task
                name: task.name,
                description: task.description || '',
                teamId: task.teamId || undefined, // Use teamId directly from the task
                status: (task.status?.toLowerCase() as 'pending' | 'in_progress' | 'completed' | 'delayed') || 'pending',
                progress: task.progress || 0,
                progressStatus: (task.progressStatus?.toLowerCase() as 'on_schedule' | 'ahead' | 'behind' | 'at_risk') || 'on_schedule',
                startDate: task.startDate ? new Date(task.startDate) : new Date(),
                endDate: task.endDate ? new Date(task.endDate) : new Date(),
                plannedStartDate: task.plannedStartDate ? new Date(task.plannedStartDate) : new Date(),
                plannedEndDate: task.plannedEndDate ? new Date(task.plannedEndDate) : new Date(),
                amount: task.amount || 0,
                isReceived: task.isReceived || false,
                isPaid: task.isPaid || false,
                photos: task.photos || [],
                remarks: task.remarks || '',
                createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
              };
              
              return frontendTask;
            });
            
            // Update the store with fetched tasks
            setTasks(frontendTasks);
          } else {
            console.log(`ℹ️ No tasks found for category ${categoryId} and villa ${villaId} in backend`);
            // Set empty tasks array to clear any previous tasks
            setTasks([]);
          }
        } catch (apiError) {
          console.error(`❌ API error fetching tasks:`, apiError);
          // Set empty tasks array on error
          const { setTasks } = useStore.getState();
          setTasks([]);
        } finally {
          // Always turn off loading state
          setLoading(false);
        }
      } catch (error) {
        console.error(`❌ Unexpected error in toggleCategory for category ${categoryId}:`, error);
        // Reset loading state in case of error
        const { setLoading } = useStore.getState();
        setLoading(false);
      }
    } else {
      newOpenCategories.delete(categoryId);
    }
    
    setOpenCategories(newOpenCategories);
  };

  const handleCreateTask = async () => {
    if (!taskFormData.name || !selectedCategoryId || !selectedVillaId) {
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Parse planned dates from form
      let plannedStartDate = taskFormData.plannedStartDate 
        ? new Date(taskFormData.plannedStartDate) 
        : new Date();
      
      let plannedEndDate = taskFormData.plannedEndDate 
        ? new Date(taskFormData.plannedEndDate) 
        : undefined;
      
      // If duration is provided but not end date, calculate end date
      if (taskFormData.duration && !plannedEndDate) {
        const durationDays = parseInt(taskFormData.duration, 10);
        plannedEndDate = new Date(plannedStartDate);
        plannedEndDate.setDate(plannedStartDate.getDate() + durationDays);
      } else if (!plannedEndDate) {
        plannedEndDate = new Date(plannedStartDate);
        plannedEndDate.setDate(plannedStartDate.getDate() + 7); // Default 7 days
      }
      
      // Parse actual dates if provided
      const actualStartDate = taskFormData.actualStartDate 
        ? new Date(taskFormData.actualStartDate) 
        : undefined;
      
      const actualEndDate = taskFormData.actualEndDate 
        ? new Date(taskFormData.actualEndDate) 
        : undefined;

      // Prepare task data for API call
      const taskData: Omit<Task, 'id'> = {
        name: taskFormData.name,
        description: taskFormData.description || '',
        categoryId: selectedCategoryId,
        villaId: selectedVillaId,
        teamId: taskFormData.teamId || undefined,
        startDate: actualStartDate || plannedStartDate,
        endDate: actualEndDate || plannedEndDate,
        plannedStartDate: plannedStartDate,
        plannedEndDate: plannedEndDate,
        status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'delayed',
        progress: taskFormData.progress || 0,
        progressStatus: taskFormData.progressStatus || 'on_schedule' as 'on_schedule' | 'ahead' | 'behind' | 'at_risk',
        isReceived: taskFormData.isReceived || false,
        isPaid: taskFormData.isPaid || false,
        amount: taskFormData.amount ? parseFloat(taskFormData.amount) : 0,
        photos: [], // Required by Task interface
        remarks: '', // Required by Task interface
        createdAt: new Date(), // Required by Task interface
        updatedAt: new Date(), // Required by Task interface
      };
      
      console.log('Creating task with data:', taskData);
      
      // Call API to create task
      const { apiService } = await import('@/lib/api');
      const createdTask = await apiService.createTask(taskData);
      
      console.log('Task created successfully:', createdTask);
      
      // Add the task to the local store with the ID from the backend
      addTask({
        ...taskData,
        id: createdTask.id.toString(),
        photos: [],
        status: (taskData.status as 'pending' | 'in_progress' | 'completed' | 'delayed'),
        teamId: taskData.teamId,
        createdAt: new Date(createdTask.createdAt || Date.now()),
        updatedAt: new Date(createdTask.updatedAt || Date.now())
      });
      
      // Close dialog and reset form
      setIsCreateTaskDialogOpen(false);
      resetTaskForm();
    } catch (error) {
      console.error('Error creating task:', error);
      // You could add error handling UI here
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    
    // Set loading state
    setLoading(true);
    
    try {
      // Parse dates from form
      const plannedStartDate = taskFormData.plannedStartDate 
        ? new Date(taskFormData.plannedStartDate) 
        : undefined;
      
      const plannedEndDate = taskFormData.plannedEndDate 
        ? new Date(taskFormData.plannedEndDate) 
        : undefined;
      
      const actualStartDate = taskFormData.actualStartDate 
        ? new Date(taskFormData.actualStartDate) 
        : undefined;
      
      const actualEndDate = taskFormData.actualEndDate 
        ? new Date(taskFormData.actualEndDate) 
        : undefined;
      
      // Prepare task update data for API call
      const taskUpdateData = {
        name: taskFormData.name,
        description: taskFormData.description || '',
        teamId: taskFormData.teamId || undefined,
        categoryId: editingTask.categoryId, // Ensure we keep the category ID
        villaId: editingTask.villaId, // Ensure we keep the villa ID
        plannedStartDate: plannedStartDate,
        plannedEndDate: plannedEndDate,
        startDate: actualStartDate || plannedStartDate,
        endDate: actualEndDate || plannedEndDate,
        amount: taskFormData.amount ? parseFloat(taskFormData.amount) : 0,
        progress: taskFormData.progress,
        progressStatus: taskFormData.progressStatus,
        status: taskFormData.status,
        isReceived: taskFormData.isReceived,
        isPaid: taskFormData.isPaid
      };
      
      console.log(`Updating task ${editingTask.id} with data:`, taskUpdateData);
      
      // Call API to update task
      const { apiService } = await import('@/lib/api');
      const updatedTask = await apiService.updateTask(editingTask.id, taskUpdateData);
      
      console.log('Task updated successfully:', updatedTask);
      
      // Update the task in the local store
      updateTask(editingTask.id, {
        ...taskUpdateData,
        updatedAt: new Date(updatedTask.updatedAt || Date.now())
      });
    } catch (error) {
      console.error('Error updating task:', error);
      // Show an error message but still close the modal
      toast({
        title: "Error updating task",
        description: "There was a problem updating the task. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Always close the modal and reset form regardless of success or failure
      setEditingTask(null);
      resetTaskForm();
      setLoading(false);
    }
  };

  const resetTaskForm = () => {
    setTaskFormData({
      name: '',
      description: '',
      teamId: selectedTeamId || '', // Use the currently selected team if available
      duration: '',
      amount: '',
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      progress: 0,
      progressStatus: 'on_schedule',
      status: 'pending',
      isReceived: false,
      isPaid: false
    });
  };
  
  const updateTaskProgress = (taskId: string, progress: number) => {
    // Find the task to get its planned dates
    const task = findTaskById(taskId);
    if (!task) return;
    
    // Calculate new task status based on progress
    const newStatus = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending';
    
    // Calculate new progress status based on dates and progress
    const newProgressStatus = calculateProgressStatus(
      task.plannedStartDate, 
      task.plannedEndDate, 
      progress
    );
    
    // Update both status and progressStatus
    updateTask(taskId, {
      progress,
      status: newStatus,
      progressStatus: newProgressStatus,
      updatedAt: new Date()
    });
  };
  
  // Function to open template selection dialog
  const openTemplateDialog = (categoryId: string, villaId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedVillaId(villaId);
    setIsTemplateDialogOpen(true);
  };
  
  // Get teams assigned to a specific category
  const getCategoryTeams = (categoryId: string) => {
    // For now, just return all teams that have tasks in this category
    const categoryTasks = getTasksByCategory(categoryId);
    const teamIds = new Set(categoryTasks.map(task => task.teamId).filter(Boolean));
    return teams.filter(team => teamIds.has(team.id));
  };
  
  // Handler for adding a new category to a villa
  const handleAddCategory = (villaId: string) => {
    setCurrentVillaId(villaId);
    setCategoryFormData({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default to 30 days
    });
    setIsAddCategoryDialogOpen(true);
  };
  
  // Handler for saving a new category
  const handleSaveCategory = async () => {
    if (!categoryFormData.name || !categoryFormData.startDate || !categoryFormData.endDate || !currentVillaId) {
      return;
    }
    
    try {
      // Set loading state
      setLoading(true);
      
      // Prepare category DTO data for the new endpoint
      const categoryDTO = {
        villaId: currentVillaId,
        name: categoryFormData.name,
        startDate: categoryFormData.startDate,
        endDate: categoryFormData.endDate
        // teamId removed as per requirement - teams are now only assigned at task level
      };
      
      console.log('📝 Creating category with DTO:', categoryDTO);
      
      // Call API to create category using the new endpoint
      const { apiService } = await import('@/lib/api');
      const newCategory = await apiService.createCategoryWithVilla(categoryDTO);
      console.log('✅ Category created successfully with villa:', newCategory);
      
      // Add the category to the store
      addCategory({
        id: newCategory.id.toString(),
        villaId: currentVillaId,
        name: newCategory.name,
        startDate: new Date(newCategory.startDate),
        endDate: new Date(newCategory.endDate),
        progress: newCategory.progress || 0,
        status: newCategory.status || 'ON_SCHEDULE',
        tasksCount: newCategory.tasksCount || 0,
        completedTasks: newCategory.completedTasks || 0
        // teamId removed as per requirement - teams are now only assigned at task level
      });
      
      // Reset form data
      setCategoryFormData({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      // Close the dialog
      setIsAddCategoryDialogOpen(false);
    } catch (error) {
      console.error('❌ Error creating category:', error);
      // You could add error handling UI here
    } finally {
      setLoading(false);
    }
  };
  
  // Team assignment for categories removed as per requirement - teams are now only assigned at task level
  
  // Implementation of openCreateTaskDialog function
  const openCreateTaskDialog = (categoryId: string, villaId: string, teamId?: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedVillaId(villaId);
    resetTaskForm();
    
    // If teamId is provided, pre-select that team
    if (teamId) {
      setTaskFormData(prev => ({ ...prev, teamId }));
    }
    
    setIsCreateTaskDialogOpen(true);
  };
  
  const applyTemplate = (templateId: string) => {
    if (!selectedCategoryId || !selectedVillaId) return;
    
    // Apply the template using the selected team if available
    applyTemplateToCategory(templateId, selectedCategoryId, selectedVillaId, selectedTeamId);
    setIsTemplateDialogOpen(false);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    
    // Calculate duration in days between planned start and end dates
    const plannedStartDate = task.plannedStartDate;
    const plannedEndDate = task.plannedEndDate;
    const durationDays = Math.ceil(
      (plannedEndDate.getTime() - plannedStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    setTaskFormData({
      name: task.name,
      description: task.description || '',
      teamId: task.teamId || '',
      duration: durationDays.toString(),
      plannedStartDate: task.plannedStartDate.toISOString().split('T')[0],
      plannedEndDate: task.plannedEndDate.toISOString().split('T')[0],
      actualStartDate: task.startDate.toISOString().split('T')[0],
      actualEndDate: task.endDate.toISOString().split('T')[0],
      amount: task.amount?.toString() || '',
      progress: task.progress,
      progressStatus: task.progressStatus,
      status: task.status || 'pending',
      isReceived: task.isReceived,
      isPaid: task.isPaid
    });
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase();
    switch (normalizedStatus) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'delayed': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressStatusColor = (status: string) => {
    switch (status) {
      case 'on_schedule': return 'text-green-600 bg-green-100';
      case 'ahead': return 'text-blue-600 bg-blue-100';
      case 'behind': return 'text-orange-600 bg-orange-100';
      case 'at_risk': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressStatusText = (status: string) => {
    switch (status) {
      case 'on_schedule': return 'Dans les temps';
      case 'ahead': return 'En avance';
      case 'behind': return 'En retard';
      case 'at_risk': return 'À risque';
      default: return status;
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Non assignée';
  };
  
  /**
   * Find a task by its ID by searching through all villas, categories, and tasks
   */
  const findTaskById = (taskId: string): Task | undefined => {
    // Search through all villas, categories, and tasks
    for (const villa of projectVillas) {
      // Use type assertion for villa.categories since it's not in the Villa type
      const categories = (villa as any).categories || [];
      for (const category of categories) {
        // Use type assertion for category.tasks since it's not in the Category type
        const tasks = (category as any).tasks || [];
        const foundTask = tasks.find((task: Task) => task.id === taskId);
        if (foundTask) return foundTask;
      }
    }
    return undefined;
  };

  /**
   * Calculates the expected progress based on planned start and end dates
   * and determines the appropriate progress status
   * Also considers actual start and end dates if they exist
   */
  const calculateProgressStatus = (plannedStartDate: Date, plannedEndDate: Date, actualProgress: number, actualStartDate?: Date, actualEndDate?: Date): 'on_schedule' | 'ahead' | 'behind' | 'at_risk' => {
    const today = new Date();
    
    // If actual dates exist, check if they are later than planned dates
    if (actualStartDate && actualStartDate > plannedStartDate) {
      // Task started later than planned
      if (actualProgress < 100) {
        return 'behind'; // Task started late and isn't completed yet
      }
    }
    
    if (actualEndDate && actualEndDate > plannedEndDate) {
      // Task ended or will end later than planned
      return actualProgress === 100 ? 'behind' : 'at_risk'; // Completed but late, or at risk if not completed
    }
    
    // If task hasn't started yet according to plan
    if (today < plannedStartDate) {
      // If there's progress despite not being scheduled to start yet
      return actualProgress > 0 ? 'ahead' : 'on_schedule';
    }
    
    // If task is past end date
    if (today > plannedEndDate) {
      // If completed, it's on schedule (even if late)
      if (actualProgress === 100) return 'on_schedule';
      // If not completed, it's at risk
      return 'at_risk';
    }
    
    // Task is in progress during its scheduled period
    // Calculate what percentage of time has elapsed
    const totalDuration = plannedEndDate.getTime() - plannedStartDate.getTime();
    const elapsedDuration = today.getTime() - plannedStartDate.getTime();
    const timeProgressPercentage = Math.round((elapsedDuration / totalDuration) * 100);
    
    // Compare actual progress with expected progress based on elapsed time
    const progressDifference = actualProgress - timeProgressPercentage;
    
    // Determine status based on the difference
    if (progressDifference >= 10) return 'ahead'; // 10% or more ahead
    if (progressDifference <= -20) return 'at_risk'; // 20% or more behind
    if (progressDifference < 0) return 'behind'; // Less than 20% behind
    return 'on_schedule'; // Within 10% of expected progress
  };
  
  const updateTaskProgressStatus = (taskId: string, progressStatus: 'on_schedule' | 'ahead' | 'behind' | 'at_risk') => {
    updateTask(taskId, { 
      progressStatus, 
      updatedAt: new Date()
    });
  };
  
  /**
   * Updates progress status for all tasks based on their planned dates and current progress
   * This can be called periodically or when the dashboard is loaded
   */
  const updateAllTaskProgressStatuses = () => {
    projectVillas.forEach((villa: Villa) => {
      // Use type assertion for villa.categories since it's not in the Villa type
      const categories = (villa as any).categories || [];
      categories.forEach((category: Category) => {
        // Use type assertion for category.tasks since it's not in the Category type
        const tasks = (category as any).tasks || [];
        tasks.forEach((task: Task) => {
          // Skip tasks that are already completed
          if (task.status === 'completed') return;
          
          // Calculate new progress status
          const newProgressStatus = calculateProgressStatus(
            task.plannedStartDate,
            task.plannedEndDate,
            task.progress,
            task.startDate, // Actual start date
            task.endDate    // Actual end date
          );
          
          // Only update if the status has changed
          if (task.progressStatus !== newProgressStatus) {
            updateTaskProgressStatus(task.id, newProgressStatus);
          }
        });
      });
    });
  };
  
  // The team assignment handlers are implemented earlier in the file

  if (!selectedProject) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Tableau de bord</h2>
          <div className="flex items-center space-x-2">
            <Label htmlFor="global-team-filter" className="whitespace-nowrap">Filtrer par équipe:</Label>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger id="global-team-filter" className="w-[200px]">
                <SelectValue placeholder="Toutes les équipes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les équipes</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={`team-filter-${team.id}`} value={team.id}>
                    {team.name} - {team.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun projet sélectionné</h2>
          <p className="text-gray-600">
            Sélectionnez un projet dans la barre de navigation pour voir le tableau de bord.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slide-in-up">
      {/* Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="category-name">Nom de la catégorie</Label>
              <Input
                id="category-name"
                placeholder="Ex: Gros Œuvre"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category-start-date">Date de début</Label>
                <Input
                  id="category-start-date"
                  type="date"
                  value={categoryFormData.startDate}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category-end-date">Date de fin</Label>
                <Input
                  id="category-end-date"
                  type="date"
                  value={categoryFormData.endDate}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveCategory}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Team Assignment Dialog */}
      <Dialog open={isAssignTeamDialogOpen} onOpenChange={setIsAssignTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner une équipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="team-assignment">Sélectionner une équipe</Label>
              <Select 
                value={teamAssignmentData.teamId} 
                onValueChange={(value) => setTeamAssignmentData(prev => ({ ...prev, teamId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={`team-assign-${team.id}`} value={team.id}>
                      {team.name} - {team.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAssignTeamDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => handleSaveTeamAssignment()}>
                Assigner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="category-name">Nom de la catégorie</Label>
              <Input
                id="category-name"
                placeholder="Ex: Gros Œuvre"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category-start-date">Date de début</Label>
                <Input
                  id="category-start-date"
                  type="date"
                  value={categoryFormData.startDate}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="category-end-date">Date de fin</Label>
                <Input
                  id="category-end-date"
                  type="date"
                  value={categoryFormData.endDate}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveCategory}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Team Assignment Dialog */}
      <Dialog open={isAssignTeamDialogOpen} onOpenChange={setIsAssignTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner une équipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="team-assignment">Sélectionner une équipe</Label>
              <Select 
                value={teamAssignmentData.teamId} 
                onValueChange={(value) => setTeamAssignmentData(prev => ({ ...prev, teamId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une équipe" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={`team-assign-${team.id}`} value={team.id}>
                      {team.name} - {team.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAssignTeamDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => handleSaveTeamAssignment()}>
                Assigner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble du projet <span className="font-semibold">{selectedProject.name}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <AIAssistant />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Tree View */}
        <div className="xl:col-span-2 space-y-6">
          {/* Project Tree View */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Structure du Projet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectVillas.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune villa dans ce projet</p>
                  </div>
                ) : (
                  projectVillas.map((villa) => {
                    const villaCategories = getCategoriesByVilla(villa.id);
                    const isVillaOpen = openVillas.has(villa.id);

                    return (
                      <Card key={`villa-${villa.id}`} className="overflow-hidden card-enhanced animate-slide-in-up" style={{ animationDelay: `${projectVillas.indexOf(villa) * 100}ms` }}>
                        <Collapsible open={isVillaOpen} onOpenChange={() => toggleVilla(villa.id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {isVillaOpen ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                  <Building2 className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <CardTitle className="text-lg">{villa.name}</CardTitle>
                                    <p className="text-sm text-gray-600">{villa.type} • {villa.surface}m²</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={getStatusColor(villa.status)}>
                                    {villa.status === 'completed' ? 'Terminée' :
                                     villa.status === 'in_progress' ? 'En cours' :
                                     villa.status === 'delayed' ? 'En retard' : 'Non démarrée'}
                                  </Badge>
                                  <span className="text-sm font-medium">{villa.progress}%</span>
                                </div>
                              </div>
                              <Progress value={villa.progress} className="h-2 mt-2" />
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-0">
                              {/* Add Category Button */}
                              <div className="flex justify-end mb-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleAddCategory(villa.id)}
                                  className="text-sm"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Ajouter Catégorie
                                </Button>
                              </div>
                              <div className="space-y-3 ml-6">
                                {villaCategories.length === 0 ? (
                                  <p className="text-gray-500 text-sm py-4">Aucune catégorie définie</p>
                                ) : (
                                  villaCategories.map((category) => {
                                    const categoryTasks = getCategoryTasks(category.id);
                                    const isCategoryOpen = openCategories.has(category.id);

                                    return (
                                      <Card key={`category-${category.id}`} className="border-l-4 border-l-orange-400">
                                        <Collapsible open={isCategoryOpen} onOpenChange={() => toggleCategory(category.id)}>
                                          <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                  {isCategoryOpen ? (
                                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                                  ) : (
                                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                                  )}
                                                  <Wrench className="h-4 w-4 text-orange-600" />
                                                  <div>
                                                    <h4 className="font-medium">{category.name}</h4>
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                      <Calendar size={14} />
                                                      <span>
                                                        {category.startDate.toLocaleDateString()} - {category.endDate.toLocaleDateString()}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline" className="text-xs">
                                                    {category.completedTasks}/{category.tasksCount}
                                                  </Badge>
                                                  <span className="text-sm font-medium">{category.progress}%</span>
                                                </div>
                                              </div>
                                              <Progress value={category.progress} className="h-1 mt-2" />
                                            </CardHeader>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <CardContent className="pt-0">
                                              <div className="space-y-3 ml-6">
                                                {/* Team Assignment section removed as per requirement - teams are now only assigned at task level */}
                                                
                                                <div className="flex justify-between items-center">
                                                  <h5 className="text-sm font-medium text-gray-700">Tâches</h5>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => openCreateTaskDialog(category.id, villa.id)}
                                                  >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Ajouter
                                                  </Button>
                                                </div>
                                                
                                                {categoryTasks.length === 0 ? (
                                                  <p className="text-gray-500 text-xs py-2">Aucune tâche</p>
                                                ) : (
                                                  categoryTasks.map((task) => {
                                                    const isTaskOpen = openTasks.has(task.id);
                                                    
                                                    return (
                                                      <Card key={`task-${task.id}`} className="border-l-4 border-l-purple-400 bg-purple-50/30">
                                                        <Collapsible 
                                                          open={isTaskOpen} 
                                                          onOpenChange={() => toggleTask(task.id)}>
                                                          <CollapsibleTrigger asChild>
                                                            <CardContent className="p-3 cursor-pointer hover:bg-purple-50 transition-colors">
                                                              <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                  {isTaskOpen ? (
                                                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                                                  ) : (
                                                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                                                  )}
                                                                  <ClipboardList className="h-4 w-4 text-purple-600" />
                                                                  <h6 className="font-medium text-sm">{task.name}</h6>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                  <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                                                    {task.status === 'completed' ? 'Terminée' :
                                                                     task.status === 'in_progress' ? 'En cours' :
                                                                     task.status === 'delayed' ? 'En retard' : 'En attente'}
                                                                  </Badge>
                                                                  <Badge className={`text-xs ${getProgressStatusColor(task.progressStatus)}`}>
                                                                    {getProgressStatusText(task.progressStatus)}
                                                                  </Badge>
                                                                  <span className="text-xs font-medium">{task.progress}%</span>
                                                                </div>
                                                              </div>
                                                              <Progress value={task.progress} className="h-1 mt-2" />
                                                            </CardContent>
                                                          </CollapsibleTrigger>
                                                          
                                                          <CollapsibleContent>
                                                            <CardContent className="pt-0 pb-3 px-4">
                                                              <div className="space-y-3 ml-6">
                                                                <div className="flex items-center justify-end space-x-2">
                                                                  <Button 
                                                                    size="sm" 
                                                                    variant="ghost"
                                                                    onClick={() => openEditTaskDialog(task)}
                                                                  >
                                                                    <Edit className="h-3 w-3 mr-1" />
                                                                    Modifier
                                                                  </Button>
                                                                  {/* <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => openTemplateDialog(category.id, villa.id)}
                                                                    title="Appliquer un template"
                                                                  >
                                                                    <FileText className="h-3 w-3 mr-1" />
                                                                    Template
                                                                  </Button> */}
                                                                </div>
                                                                
                                                                {/* Task Details */}
                                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                                  <div>
                                                                    <span className="text-gray-600">Équipe:</span>
                                                                    <p className="font-medium">{getTeamName(task.teamId || '')}</p>
                                                                  </div>
                                                                  <div>
                                                                    <span className="text-gray-600">Montant:</span>
                                                                    <p className="font-medium">
                                                                      {task.amount ? `${task.amount.toLocaleString()} DH` : 'N/A'}
                                                                    </p>
                                                                  </div>
                                                                </div>

                                                                {/* Planning Section */}
                                                                <div className="bg-blue-50 p-3 rounded-lg">
                                                                  <h6 className="text-xs font-medium text-blue-800 mb-2">Planification</h6>
                                                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                                                    <div>
                                                                      <span className="text-blue-600">Début prévu:</span>
                                                                      <p className="font-medium">{task.plannedStartDate.toLocaleDateString()}</p>
                                                                    </div>
                                                                    <div>
                                                                      <span className="text-blue-600">Fin prévue:</span>
                                                                      <p className="font-medium">{task.plannedEndDate.toLocaleDateString()}</p>
                                                                    </div>
                                                                    <div>
                                                                      <span className="text-blue-600">Début réel:</span>
                                                                      <p className={`font-medium ${task.startDate.getTime() !== task.plannedStartDate.getTime() ? 'text-orange-600' : ''}`}>
                                                                        {task.startDate.toLocaleDateString()}
                                                                        {task.startDate.getTime() !== task.plannedStartDate.getTime() && (
                                                                          <AlertTriangle className="h-3 w-3 inline ml-1" />
                                                                        )}
                                                                      </p>
                                                                    </div>
                                                                    <div>
                                                                      <span className="text-blue-600">Fin réelle:</span>
                                                                      <p className={`font-medium ${task.endDate.getTime() !== task.plannedEndDate.getTime() ? 'text-orange-600' : ''}`}>
                                                                        {task.endDate.toLocaleDateString()}
                                                                        {task.endDate.getTime() !== task.plannedEndDate.getTime() && (
                                                                          <AlertTriangle className="h-3 w-3 inline ml-1" />
                                                                        )}
                                                                      </p>
                                                                    </div>
                                                                  </div>
                                                                </div>

                                                                {/* Progress Control */}
                                                                {/* <div className="space-y-2"> */}
                                                                  {/* <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-600">Progression:</span>
                                                                    <div className="flex items-center space-x-2">
                                                                      <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max="100"
                                                                        value={task.progress}
                                                                        onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value) || 0)}
                                                                        className="w-16 h-6 text-xs"
                                                                      />
                                                                      <span className="text-xs">%</span>
                                                                    </div>
                                                                  </div>
                                                                  <Progress value={task.progress} className="h-2" />
                                                                  
                                                                  <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-gray-600">Statut:</span>
                                                                    <Select 
                                                                      value={task.progressStatus} 
                                                                      onValueChange={(value: any) => updateTaskProgressStatus(task.id, value)}
                                                                    >
                                                                      <SelectTrigger className="w-32 h-6 text-xs">
                                                                        <SelectValue />
                                                                      </SelectTrigger>
                                                                      <SelectContent>
                                                                        <SelectItem value="on_schedule">Dans les temps</SelectItem>
                                                                        <SelectItem value="ahead">En avance</SelectItem>
                                                                        <SelectItem value="behind">En retard</SelectItem>
                                                                        <SelectItem value="at_risk">À risque</SelectItem>
                                                                      </SelectContent>
                                                                    </Select>
                                                                  </div> */}
                                                                  
                                                                  {/* <Badge className={`text-xs ${getProgressStatusColor(task.progressStatus)}`}>
                                                                    {getProgressStatusText(task.progressStatus)}
                                                                  </Badge> */}
                                                                {/* </div> */}

                                                                {/* Task Status Indicators */}
                                                                <div className="flex items-center space-x-4 text-xs">
                                                                  <div className="flex items-center space-x-1">
                                                                    <CheckCircle className={`h-3 w-3 ${task.isReceived ? 'text-green-600' : 'text-gray-400'}`} />
                                                                    <span>Réceptionnée</span>
                                                                  </div>
                                                                  <div className="flex items-center space-x-1">
                                                                    <DollarSign className={`h-3 w-3 ${task.isPaid ? 'text-green-600' : 'text-gray-400'}`} />
                                                                    <span>Payée</span>
                                                                  </div>
                                                                </div>

                                                                {task.description && (
                                                                  <div className="text-xs">
                                                                    <span className="text-gray-600">Remarques:</span>
                                                                    <p className="mt-1">{task.description}</p>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </CardContent>
                                                          </CollapsibleContent>
                                                        </Collapsible>
                                                      </Card>
                                                    );
                                                  })
                                                )}
                                              </div>
                                            </CardContent>
                                          </CollapsibleContent>
                                        </Collapsible>
                                      </Card>
                                    );
                                  })
                                )}
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Overview & Activity */}
        <div className="space-y-6">
          <ProjectOverview />
          <RecentActivity />
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskDialogOpen} onOpenChange={setIsCreateTaskDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
          <div>
                <Label htmlFor="task-team">Équipe</Label>
                <Select value={taskFormData.teamId} onValueChange={handleTaskTeamChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une équipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={`team-task-${team.id}`} value={team.id}>
                        {team.name} - {team.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <Label htmlFor="task-name">Nom de la tâche</Label>
                {/* Debug info */}
                <div className="text-xs text-gray-500 mb-1">
                  Taches disponibles: {teamTaskTemplates.length}
                </div>
                {teamTaskTemplates.length > 0 ? (
                  <Select 
                    value={taskFormData.name} 
                    onValueChange={(value) => {
                      // Find the selected template
                      const selectedTemplate = teamTaskTemplates.find(t => t.name === value);
                      
                      // Update form with template data
                      setTaskFormData(prev => ({
                        ...prev,
                        name: value,
                        description: selectedTemplate?.description || prev.description,
                        duration: selectedTemplate?.durationDays?.toString() || prev.duration,
                        amount: selectedTemplate?.defaultAmount?.toString() || prev.amount
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une tâche" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamTaskTemplates.map((template) => (
                        <SelectItem key={`template-${template.id}`} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="task-name"
                    value={taskFormData.name}
                    onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                    placeholder="Ex: Installation conduits"
                  />
                )}
              </div>
              
            </div>

            <div>
              <Label htmlFor="task-description">Remarques</Label>
              <Textarea
                id="task-description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Remarques..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-planned-start">Date prévue début</Label>
                <Input
                  id="task-planned-start"
                  type="date"
                  value={taskFormData.plannedStartDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, plannedStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="task-planned-end">Date prévue fin</Label>
                <Input
                  id="task-planned-end"
                  type="date"
                  value={taskFormData.plannedEndDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, plannedEndDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-actual-start">Date réelle début</Label>
                <Input
                  id="task-actual-start"
                  type="date"
                  value={taskFormData.actualStartDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, actualStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="task-actual-end">Date réelle fin</Label>
                <Input
                  id="task-actual-end"
                  type="date"
                  value={taskFormData.actualEndDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, actualEndDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-duration">Durée (jours)</Label>
                <Input
                  id="task-duration"
                  type="number"
                  min="1"
                  placeholder="Ex: 7"
                  value={taskFormData.duration}
                  onChange={(e) => {
                    const duration = e.target.value;
                    setTaskFormData({ ...taskFormData, duration });
                    
                    // Update planned end date based on duration if planned start date exists
                    if (taskFormData.plannedStartDate) {
                      const startDate = new Date(taskFormData.plannedStartDate);
                      const endDate = new Date(startDate);
                      endDate.setDate(startDate.getDate() + parseInt(duration || '0'));
                      setTaskFormData(prev => ({
                        ...prev,
                        duration,
                        plannedEndDate: endDate.toISOString().split('T')[0]
                      }));
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="task-amount">Montant (DH)</Label>
                <Input
                  id="task-amount"
                  type="number"
                  placeholder="Ex: 5000"
                  value={taskFormData.amount}
                  onChange={(e) => setTaskFormData({ ...taskFormData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="task-progress">Progression (%)</Label>
                <Input
                  id="task-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={taskFormData.progress}
                  onChange={(e) => setTaskFormData({ ...taskFormData, progress: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 mt-8">
                <input
                  type="checkbox"
                  id="task-received"
                  checked={taskFormData.isReceived}
                  onChange={(e) => setTaskFormData({ ...taskFormData, isReceived: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="task-received">Réceptionnée</Label>
              </div>
              <div className="flex items-center space-x-2 mt-8">
                <input
                  type="checkbox"
                  id="task-paid"
                  checked={taskFormData.isPaid}
                  onChange={(e) => setTaskFormData({ ...taskFormData, isPaid: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="task-paid">Payée</Label>
              </div>
              <div>
                <Label htmlFor="progress-status">Statut progression</Label>
                <Select value={taskFormData.progressStatus} onValueChange={(value: any) => setTaskFormData({ ...taskFormData, progressStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_schedule">Dans les temps</SelectItem>
                    <SelectItem value="ahead">En avance</SelectItem>
                    <SelectItem value="behind">En retard</SelectItem>
                    <SelectItem value="at_risk">À risque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateTaskDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTask}>
                Créer la tâche
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Selection Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appliquer un template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="team-select">Équipe</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une équipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les équipes</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={`team-filter-${team.id}`} value={team.id}>
                      {team.name} - {team.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">Sélectionnez une équipe pour filtrer les tâches du template</p>
            </div>
            
            <div className="space-y-2">
              <Label>Templates disponibles</Label>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                {templates.map((template) => (
                  <Card key={`template-${template.id}`} className="cursor-pointer hover:bg-gray-50" onClick={() => applyTemplate(template.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Appliquer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-name">Nom de la tâche</Label>
                <Input
                  id="edit-task-name"
                  value={taskFormData.name}
                  onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-team">Équipe</Label>
                <Select value={taskFormData.teamId} onValueChange={handleTaskTeamChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une équipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={`team-task-${team.id}`} value={team.id}>
                        {team.name} - {team.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-task-description">Remarques</Label>
              <Textarea
                id="edit-task-description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-planned-start">Date prévue début</Label>
                <Input
                  id="edit-planned-start"
                  type="date"
                  value={taskFormData.plannedStartDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, plannedStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-planned-end">Date prévue fin</Label>
                <Input
                  id="edit-planned-end"
                  type="date"
                  value={taskFormData.plannedEndDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, plannedEndDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-actual-start">Date réelle début</Label>
                <Input
                  id="edit-actual-start"
                  type="date"
                  value={taskFormData.actualStartDate}
                  onChange={(e) => {
                    const actualStartDate = e.target.value;
                    
                    // Recalculate progress status when actual start date changes
                    const plannedStartDate = new Date(taskFormData.plannedStartDate);
                    const plannedEndDate = new Date(taskFormData.plannedEndDate);
                    const newActualStartDate = actualStartDate ? new Date(actualStartDate) : undefined;
                    const actualEndDate = taskFormData.actualEndDate ? new Date(taskFormData.actualEndDate) : undefined;
                    
                    const newProgressStatus = calculateProgressStatus(
                      plannedStartDate,
                      plannedEndDate,
                      taskFormData.progress,
                      newActualStartDate,
                      actualEndDate
                    );
                    
                    setTaskFormData({ 
                      ...taskFormData, 
                      actualStartDate, 
                      progressStatus: newProgressStatus 
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="edit-actual-end">Date réelle fin</Label>
                <Input
                  id="edit-actual-end"
                  type="date"
                  value={taskFormData.actualEndDate}
                  onChange={(e) => {
                    const actualEndDate = e.target.value;
                    
                    // Recalculate progress status when actual end date changes
                    const plannedStartDate = new Date(taskFormData.plannedStartDate);
                    const plannedEndDate = new Date(taskFormData.plannedEndDate);
                    const actualStartDate = taskFormData.actualStartDate ? new Date(taskFormData.actualStartDate) : undefined;
                    const newActualEndDate = actualEndDate ? new Date(actualEndDate) : undefined;
                    
                    const newProgressStatus = calculateProgressStatus(
                      plannedStartDate,
                      plannedEndDate,
                      taskFormData.progress,
                      actualStartDate,
                      newActualEndDate
                    );
                    
                    setTaskFormData({ 
                      ...taskFormData, 
                      actualEndDate, 
                      progressStatus: newProgressStatus 
                    });
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-duration">Durée (jours)</Label>
                <Input
                  id="edit-task-duration"
                  type="number"
                  min="1"
                  placeholder="Ex: 7"
                  value={taskFormData.duration}
                  onChange={(e) => {
                    const duration = e.target.value;
                    
                    // Update planned end date based on duration if planned start date exists
                    if (taskFormData.plannedStartDate) {
                      const startDate = new Date(taskFormData.plannedStartDate);
                      const endDate = new Date(startDate);
                      endDate.setDate(startDate.getDate() + parseInt(duration || '0'));
                      setTaskFormData(prev => ({
                        ...prev,
                        duration,
                        plannedEndDate: endDate.toISOString().split('T')[0]
                      }));
                    } else {
                      setTaskFormData({ ...taskFormData, duration });
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="edit-task-amount">Montant (DH)</Label>
                <Input
                  id="edit-task-amount"
                  type="number"
                  placeholder="Ex: 5000"
                  value={taskFormData.amount}
                  onChange={(e) => setTaskFormData({ ...taskFormData, amount: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-progress">Progression (%)</Label>
                <Input
                  id="edit-task-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={taskFormData.progress}
                  onChange={(e) => {
                    const progress = parseInt(e.target.value) || 0;
                    
                    // Calculate new status based on progress
                    const newStatus = progress === 100 ? 'completed' : 
                                    progress > 0 ? 'in_progress' : 'pending';
                    
                    // Calculate new progress status based on dates and progress
                    const plannedStartDate = new Date(taskFormData.plannedStartDate);
                    const plannedEndDate = new Date(taskFormData.plannedEndDate);
                    const actualStartDate = taskFormData.actualStartDate ? new Date(taskFormData.actualStartDate) : undefined;
                    const actualEndDate = taskFormData.actualEndDate ? new Date(taskFormData.actualEndDate) : undefined;
                    
                    const newProgressStatus = calculateProgressStatus(
                      plannedStartDate,
                      plannedEndDate,
                      progress,
                      actualStartDate,
                      actualEndDate
                    );
                    
                    setTaskFormData({ 
                      ...taskFormData, 
                      progress,
                      status: newStatus,
                      progressStatus: newProgressStatus
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="edit-progress-status">Statut progression</Label>
                <Select value={taskFormData.progressStatus} onValueChange={(value: any) => setTaskFormData({ ...taskFormData, progressStatus: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_schedule">Dans les temps</SelectItem>
                    <SelectItem value="ahead">En avance</SelectItem>
                    <SelectItem value="behind">En retard</SelectItem>
                    <SelectItem value="at_risk">À risque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-task-status">Statut</Label>
                <Select value={taskFormData.status} onValueChange={(value: any) => setTaskFormData({ ...taskFormData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="delayed">En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-task-received"
                  checked={taskFormData.isReceived}
                  onChange={(e) => setTaskFormData({ ...taskFormData, isReceived: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-task-received">Réceptionnée</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-task-paid"
                  checked={taskFormData.isPaid}
                  onChange={(e) => setTaskFormData({ ...taskFormData, isPaid: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-task-paid">Payée</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateTask}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog - Simplified Implementation */}
      {isAddCategoryDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Ajouter une catégorie</h3>
              <button 
                onClick={() => setIsAddCategoryDialogOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Nom de la catégorie</Label>
                <Input
                  id="category-name"
                  placeholder="Ex: Gros œuvre"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category-start-date">Date de début</Label>
                  <Input
                    id="category-start-date"
                    type="date"
                    value={categoryFormData.startDate}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category-end-date">Date de fin</Label>
                  <Input
                    id="category-end-date"
                    type="date"
                    value={categoryFormData.endDate}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={() => setIsAddCategoryDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="button"
                  onClick={handleSaveCategory}
                >
                  Sauvegarder
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}