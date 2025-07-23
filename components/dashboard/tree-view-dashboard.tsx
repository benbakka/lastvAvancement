'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { Task, Category, Template } from '@/lib/types';
import { applyTemplateToCategory, filterTasksByTeam } from '@/lib/template-utils';

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
    addCategory
  } = useStore();

  const [openVillas, setOpenVillas] = useState<Set<string>>(new Set());
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedVillaId, setSelectedVillaId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  // Add state for category and team dialogs
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [isAssignTeamDialogOpen, setIsAssignTeamDialogOpen] = useState(false);
  const [currentVillaId, setCurrentVillaId] = useState<string>('');
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');
  
  // Form data for categories and team assignments
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  
  const [teamAssignmentData, setTeamAssignmentData] = useState({
    teamId: ''
  });
  
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
    isReceived: false,
    isPaid: false
  });

  useEffect(() => {
    setTaskFormData(prev => ({
      ...prev,
      teamId: selectedTeamId === 'all' ? '' : (selectedTeamId || prev.teamId)
    }));
  }, [selectedTeamId]);

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

  const toggleVilla = (villaId: string) => {
    const newOpenVillas = new Set(openVillas);
    if (newOpenVillas.has(villaId)) {
      newOpenVillas.delete(villaId);
    } else {
      newOpenVillas.add(villaId);
    }
    setOpenVillas(newOpenVillas);
  };

  const toggleCategory = (categoryId: string) => {
    const newOpenCategories = new Set(openCategories);
    if (newOpenCategories.has(categoryId)) {
      newOpenCategories.delete(categoryId);
    } else {
      newOpenCategories.add(categoryId);
    }
    setOpenCategories(newOpenCategories);
  };

  const handleCreateTask = () => {
    if (!selectedCategoryId || !taskFormData.name.trim()) return;

    // Use the selected villa ID directly instead of looking up the category
    if (!selectedVillaId) return;
    
    // Calculate dates based on form inputs or defaults
    const today = new Date();
    
    // Parse planned dates from form or use defaults
    const plannedStartDate = taskFormData.plannedStartDate 
      ? new Date(taskFormData.plannedStartDate) 
      : new Date(today);
    
    // If duration is provided, calculate planned end date based on duration
    // Otherwise use the provided planned end date or default to 7 days
    let plannedEndDate;
    if (taskFormData.duration) {
      const durationDays = parseInt(taskFormData.duration);
      plannedEndDate = new Date(plannedStartDate);
      plannedEndDate.setDate(plannedStartDate.getDate() + durationDays);
    } else if (taskFormData.plannedEndDate) {
      plannedEndDate = new Date(taskFormData.plannedEndDate);
    } else {
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

    const newTask: Task = {
      id: Date.now().toString(),
      categoryId: selectedCategoryId,
      villaId: selectedVillaId,
      name: taskFormData.name,
      description: taskFormData.description,
      teamId: taskFormData.teamId,
      startDate: actualStartDate || plannedStartDate,
      endDate: actualEndDate || plannedEndDate,
      plannedStartDate: plannedStartDate,
      plannedEndDate: plannedEndDate,
      status: 'pending',
      progress: taskFormData.progress || 0,
      progressStatus: taskFormData.progressStatus || 'on_schedule',
      isReceived: taskFormData.isReceived || false,
      isPaid: taskFormData.isPaid || false,
      amount: taskFormData.amount ? parseFloat(taskFormData.amount) : undefined,
      photos: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addTask(newTask);
    setIsCreateTaskDialogOpen(false);
    resetTaskForm();
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

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

    updateTask(editingTask.id, {
      name: taskFormData.name,
      description: taskFormData.description,
      teamId: taskFormData.teamId,
      plannedStartDate: plannedStartDate,
      plannedEndDate: plannedEndDate,
      startDate: actualStartDate || plannedStartDate,
      endDate: actualEndDate || plannedEndDate,
      amount: taskFormData.amount ? parseFloat(taskFormData.amount) : undefined,
      progress: taskFormData.progress,
      progressStatus: taskFormData.progressStatus,
      isReceived: taskFormData.isReceived,
      isPaid: taskFormData.isPaid,
      updatedAt: new Date()
    });

    setEditingTask(null);
    resetTaskForm();
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
      isReceived: false,
      isPaid: false
    });
  };
  
  const updateTaskProgress = (taskId: string, progress: number) => {
    updateTask(taskId, {
      progress,
      updatedAt: new Date(),
      status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending'
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
  const handleSaveCategory = () => {
    if (!categoryFormData.name || !categoryFormData.startDate || !categoryFormData.endDate || !currentVillaId) {
      return;
    }
    
    const newCategory: Category = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      villaId: currentVillaId,
      name: categoryFormData.name,
      startDate: new Date(categoryFormData.startDate),
      endDate: new Date(categoryFormData.endDate),
      progress: 0,
      status: 'on_schedule',
      tasksCount: 0,
      completedTasks: 0
    };
    
    // Add the category to the store
    addCategory(newCategory);
    
    // Close the dialog
    setIsAddCategoryDialogOpen(false);
  };
  
  // Handler for assigning a team to a category
  const handleAssignTeam = (categoryId: string, villaId: string) => {
    setCurrentCategoryId(categoryId);
    setCurrentVillaId(villaId);
    setTeamAssignmentData({ teamId: '' });
    setIsAssignTeamDialogOpen(true);
  };
  
  // Handler for saving a team assignment
  const handleSaveTeamAssignment = () => {
    if (!teamAssignmentData.teamId || !currentCategoryId || !currentVillaId) {
      return;
    }
    
    // Directly create a default task for this team to establish the association
    const team = teams.find(t => t.id === teamAssignmentData.teamId);
    if (!team) return;
    
    // Create dates for the task
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const newTask: Task = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      categoryId: currentCategoryId,
      villaId: currentVillaId,
      name: `Travail - ${team.name}`,
      description: `Tâche assignée à l'équipe ${team.name} - ${team.specialty}`,
      teamId: team.id,
      status: 'pending',
      progressStatus: 'on_schedule',
      startDate: today,
      endDate: nextWeek,
      plannedStartDate: today,
      plannedEndDate: nextWeek,
      progress: 0,
      isReceived: false,
      isPaid: false,
      photos: [],
      createdAt: today,
      updatedAt: today
    };
    
    // Add the task to the store
    addTask(newTask);
    
    // Close the dialog
    setIsAssignTeamDialogOpen(false);
  };
  
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
      isReceived: task.isReceived,
      isPaid: task.isPaid
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const updateTaskProgressStatus = (taskId: string, progressStatus: 'on_schedule' | 'ahead' | 'behind' | 'at_risk') => {
    updateTask(taskId, { 
      progressStatus, 
      updatedAt: new Date()
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
              <Button onClick={handleSaveTeamAssignment}>
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
              <Button onClick={handleSaveTeamAssignment}>
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
                                                {/* Team Assignment and Tasks Section */}
                                                <div className="flex justify-between items-center mb-3">
                                                  <h5 className="text-sm font-medium text-gray-700">Équipes assignées</h5>
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleAssignTeam(category.id, villa.id)}
                                                    className="text-sm"
                                                  >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Assigner Équipe
                                                  </Button>
                                                </div>
                                                
                                                {/* Assigned Teams Display */}
                                                {getCategoryTeams(category.id).length === 0 ? (
                                                  <p className="text-gray-500 text-xs py-2 mb-3">Aucune équipe assignée</p>
                                                ) : (
                                                  <div className="mb-4 space-y-2">
                                                    {getCategoryTeams(category.id).map(team => (
                                                      <div key={`team-${category.id}-${team.id}`} className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
                                                        <div className="flex items-center">
                                                          <Users className="h-4 w-4 text-blue-600 mr-2" />
                                                          <span className="text-sm">{team.name} - {team.specialty}</span>
                                                        </div>
                                                        <Button 
                                                          size="sm" 
                                                          variant="ghost"
                                                          onClick={() => openCreateTaskDialog(category.id, villa.id, team.id)}
                                                          className="text-xs"
                                                        >
                                                          <Plus className="h-3 w-3 mr-1" />
                                                          Tâche
                                                        </Button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                                
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
                                                  categoryTasks.map((task) => (
                                                    <Card key={`task-${task.id}`} className="border-l-4 border-l-purple-400 bg-purple-50/30">
                                                      <CardContent className="p-4">
                                                        <div className="space-y-1">
                                                          {/* Task Header */}
                                                          <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                              <ClipboardList className="h-4 w-4 text-purple-600" />
                                                              <h6 className="font-medium text-sm">{task.name}</h6>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                                                {task.status === 'completed' ? 'Terminée' :
                                                                 task.status === 'in_progress' ? 'En cours' :
                                                                 task.status === 'delayed' ? 'En retard' : 'En attente'}
                                                              </Badge>
                                                              <Button 
                                                                size="sm" 
                                                                variant="ghost"
                                                                onClick={() => openEditTaskDialog(task)}
                                                              >
                                                                <Edit className="h-3 w-3" />
                                                              </Button>
                                                              <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                onClick={() => openTemplateDialog(category.id, villa.id)}
                                                                title="Appliquer un template"
                                                              >
                                                                <FileText className="h-4 w-4" />
                                                              </Button>
                                                            </div>
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
                                                          <div className="space-y-2">
                                                            <div className="flex items-center justify-between">
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
                                                            </div>
                                                            
                                                            <Badge className={`text-xs ${getProgressStatusColor(task.progressStatus)}`}>
                                                              {getProgressStatusText(task.progressStatus)}
                                                            </Badge>
                                                          </div>

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
                                                              <span className="text-gray-600">Description:</span>
                                                              <p className="mt-1">{task.description}</p>
                                                            </div>
                                                          )}
                                                        </div>
                                                      </CardContent>
                                                    </Card>
                                                  ))
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle tâche</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-name">Nom de la tâche</Label>
                <Input
                  id="task-name"
                  value={taskFormData.name}
                  onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                  placeholder="Ex: Installation conduits"
                />
              </div>
              <div>
                <Label htmlFor="task-team">Équipe</Label>
                <Select value={taskFormData.teamId} onValueChange={(value) => setTaskFormData({ ...taskFormData, teamId: value })}>
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
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Description détaillée de la tâche..."
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
        <DialogContent className="max-w-2xl">
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
        <DialogContent className="max-w-2xl">
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
                <Select value={taskFormData.teamId} onValueChange={(value) => setTaskFormData({ ...taskFormData, teamId: value })}>
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
              <Label htmlFor="edit-task-description">Description</Label>
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
                  onChange={(e) => setTaskFormData({ ...taskFormData, actualStartDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-actual-end">Date réelle fin</Label>
                <Input
                  id="edit-actual-end"
                  type="date"
                  value={taskFormData.actualEndDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, actualEndDate: e.target.value })}
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
                  onChange={(e) => setTaskFormData({ ...taskFormData, progress: parseInt(e.target.value) || 0 })}
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
    </div>
  );
}