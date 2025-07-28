'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Plus, 
  Search, 
  Users, 
  Edit,
  Trash2,
  Eye,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Team, Task } from '@/lib/types';

export function TeamsManager() {
  const { 
    teams, 
    categories, 
    villas, 
    tasks,
    addTeam, 
    updateTeam, 
    deleteTeam,
    addTask,
    selectedProject,
    getVillasByProject 
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [viewingTeam, setViewingTeam] = useState<Team | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    membersCount: '',
    tasks: [] as {
      name: string;
      description: string;
      duration: string; // Duration in days instead of start/end dates
      amount: string;
    }[]
  });

  // Log teams for debugging
  console.log(`TeamsManager: Found ${teams.length} teams in store:`, teams);
  
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  console.log(`TeamsManager: After filtering, displaying ${filteredTeams.length} teams`);

  const projectVillas = selectedProject ? getVillasByProject(selectedProject.id) : [];
  const availableCategories = categories.filter(cat => 
    projectVillas.some(villa => villa.id === cat.villaId)
  );

  const handleCreateTeam = async () => {
    try {
      setIsCreateDialogOpen(false); // Close dialog immediately to improve UX
      
      // Prepare the team data
      const teamData = {
        name: formData.name,
        specialty: formData.specialty,
        membersCount: parseInt(formData.membersCount),
        activeTasks: 0,
        performance: 0,
        lastActivity: new Date()
      };
      
      console.log('Creating team with data:', teamData);
      
      let savedTeam;
      
      // Check if we have default tasks to create
      if (formData.tasks.length > 0) {
        console.log('Creating team with default tasks:', formData.tasks);
        
        // Convert task form data to the format expected by the API
        const defaultTasks = formData.tasks.map(task => ({
          name: task.name,
          description: task.description || '',
          durationDays: parseInt(task.duration || '1'),
          defaultAmount: task.amount ? parseFloat(task.amount) : 0
        }));
        
        // Use the new API endpoint to create team with default tasks in one call
        savedTeam = await apiService.createTeamWithDefaultTasks(teamData, defaultTasks);
        console.log('Team with default tasks saved to backend:', savedTeam);
      } else {
        // If no tasks, just create the team
        savedTeam = await apiService.createTeam(teamData);
        console.log('Team saved to backend:', savedTeam);
      }
      
      // Add the team with backend-generated ID to the store
      addTeam(savedTeam);
      
      // Reset the form
      resetForm();
      
      // Show success message
      alert('Équipe créée avec succès!');
    } catch (error) {
      console.error('Failed to create team:', error);
      // Show error message
      alert('Erreur lors de la création de l\'équipe: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;
    
    try {
      setEditingTeam(null); // Close dialog immediately to improve UX
      
      // Prepare the team update data
      const teamUpdates = {
        name: formData.name,
        specialty: formData.specialty,
        membersCount: parseInt(formData.membersCount)
      };
      
      console.log(`Updating team ${editingTeam.id} with data:`, teamUpdates);
      
      // Save to backend using the API service
      const updatedTeam = await apiService.updateTeam(editingTeam.id, teamUpdates);
      console.log('Team updated in backend:', updatedTeam);
      
      // Update the team in the store
      updateTeam(editingTeam.id, teamUpdates);
      
      resetForm();
    } catch (error) {
      console.error('Failed to update team:', error);
      // You could add a toast notification here to inform the user of the error
    }
  };
  
  const handleDeleteTeam = async (teamId: string) => {
    try {
      console.log(`Deleting team ${teamId}`);
      
      // Delete from backend using the API service
      await apiService.deleteTeam(teamId);
      console.log(`Team ${teamId} deleted from backend`);
      
      // Remove from the store after successful backend deletion
      deleteTeam(teamId);
    } catch (error) {
      console.error(`Failed to delete team ${teamId}:`, error);
      // You could add a toast notification here to inform the user of the error
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      specialty: '',
      membersCount: '',
      tasks: []
    });
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      specialty: team.specialty,
      membersCount: team.membersCount.toString(),
      tasks: []
    });
  };

  const addTaskToForm = () => {
    setFormData({
      ...formData,
      tasks: [...formData.tasks, {
        name: '',
        description: '',
        duration: '',
        amount: ''
      }]
    });
  };

  const removeTaskFromForm = (index: number) => {
    setFormData({
      ...formData,
      tasks: formData.tasks.filter((_, i) => i !== index)
    });
  };

  const updateTaskInForm = (index: number, field: string, value: string) => {
    const updatedTasks = [...formData.tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setFormData({ ...formData, tasks: updatedTasks });
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 75) return 'text-blue-600';
    if (performance >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActivityStatus = (lastActivity: Date) => {
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActivity === 0) return { text: 'Aujourd\'hui', color: 'text-green-600' };
    if (daysSinceActivity === 1) return { text: 'Hier', color: 'text-blue-600' };
    if (daysSinceActivity <= 3) return { text: `Il y a ${daysSinceActivity} jours`, color: 'text-yellow-600' };
    return { text: `Il y a ${daysSinceActivity} jours`, color: 'text-red-600' };
  };

  // State to store team tasks
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  // Effect to load tasks when viewingTeam changes
  useEffect(() => {
    if (viewingTeam) {
      // Load tasks when a team is selected for viewing
      fetchTeamTasks(viewingTeam.id);
    }
  }, [viewingTeam]);

  // Fetch task templates for a specific team
  const fetchTeamTasks = async (teamId: string) => {
    try {
      setLoadingTasks(true);
      setCurrentTeamId(teamId);
      console.log(`Fetching task templates for team ${teamId}...`);
      const fetchedTemplates = await apiService.getTaskTemplatesByTeamId(teamId);
      console.log(`Fetched ${fetchedTemplates.length} task templates for team ${teamId}:`, fetchedTemplates);
      
      // Convert task templates to the format expected by the UI
      const now = new Date();
      const tasksFromTemplates: Task[] = fetchedTemplates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description || '',
        status: 'pending' as const, // Default status for templates
        progress: 0, // Default progress for templates
        villaId: '', // These will be assigned when tasks are created from templates
        categoryId: '',
        teamId: teamId,
        amount: template.defaultAmount || 0,
        isReceived: false,
        isPaid: false,
        // Required fields for Task interface
        templateId: template.id,
        startDate: now,
        endDate: new Date(now.getTime() + (template.durationDays || 1) * 24 * 60 * 60 * 1000),
        plannedStartDate: now,
        plannedEndDate: new Date(now.getTime() + (template.durationDays || 1) * 24 * 60 * 60 * 1000),
        progressStatus: 'on_schedule' as const,
        photos: [],
        createdAt: template.createdAt || now,
        updatedAt: template.updatedAt || now
      }));
      
      setTeamTasks(tasksFromTemplates);
      return tasksFromTemplates;
    } catch (error) {
      console.error('Failed to fetch team task templates:', error);
      setTeamTasks([]);
      return [];
    } finally {
      setLoadingTasks(false);
    }
  };
  
  // For backward compatibility with existing code
  const getTeamTasks = (teamId: string) => {
    // If we're viewing this team already, return the cached tasks
    if (teamId === currentTeamId) {
      return teamTasks;
    }
    // Otherwise, fetch the tasks (but this is now handled by the useEffect)
    return tasks.filter(task => task.teamId === teamId);
  };

  const getVillaName = (villaId: string) => {
    const villa = projectVillas.find(v => v.id === villaId);
    return villa?.name || 'Villa inconnue';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Catégorie inconnue';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Équipes</h1>
          <p className="text-gray-600 mt-1">Gérez vos équipes et assignez leurs tâches</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Équipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle équipe</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Team Basic Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Nom de l'équipe</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Équipe Maçonnerie"
                  />
                </div>
                <div>
                  <Label htmlFor="specialty">Spécialité</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Gros Œuvre, Plomberie"
                  />
                </div>
                <div>
                  <Label htmlFor="membersCount">Nombre de membres</Label>
                  <Input
                    id="membersCount"
                    type="number"
                    value={formData.membersCount}
                    onChange={(e) => setFormData({ ...formData, membersCount: e.target.value })}
                    placeholder="Ex: 5"
                  />
                </div>
              </div>

              {/* Tasks Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Tâches à assigner</Label>
                  <Button type="button" variant="outline" onClick={addTaskToForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une tâche
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.tasks.map((task, index) => (
                    <Card key={index} className="p-4 border-2 border-dashed">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Tâche #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTaskFromForm(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nom de la tâche</Label>
                            <Input
                              value={task.name}
                              onChange={(e) => updateTaskInForm(index, 'name', e.target.value)}
                              placeholder="Ex: Installation conduits"
                            />
                          </div>
                          <div>
                            <Label>Montant (DH)</Label>
                            <Input
                              type="number"
                              value={task.amount}
                              onChange={(e) => updateTaskInForm(index, 'amount', e.target.value)}
                              placeholder="Ex: 15000"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={task.description}
                            onChange={(e) => updateTaskInForm(index, 'description', e.target.value)}
                            placeholder="Description détaillée de la tâche..."
                          />
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Durée (jours)</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Ex: 7"
                              value={task.duration}
                              onChange={(e) => updateTaskInForm(index, 'duration', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Montant (DH)</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 5000"
                              value={task.amount}
                              onChange={(e) => updateTaskInForm(index, 'amount', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}

                  {formData.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Aucune tâche assignée</p>
                      <p className="text-sm">Cliquez sur "Ajouter une tâche" pour commencer</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateTeam}>
                  Créer l'équipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher une équipe..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teams.length}</div>
              <div className="text-sm text-gray-600">Équipes totales</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {teams.filter(t => t.activeTasks > 0).length}
              </div>
              <div className="text-sm text-gray-600">Équipes actives</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {teams.reduce((sum, team) => sum + team.activeTasks, 0)}
              </div>
              <div className="text-sm text-gray-600">Tâches en cours</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(teams.reduce((sum, team) => sum + team.performance, 0) / teams.length || 0)}%
              </div>
              <div className="text-sm text-gray-600">Performance moyenne</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => {
          const activityStatus = getActivityStatus(team.lastActivity);
          // Use the tasks from the store for the card display
          const teamTasksFromStore = tasks.filter(task => task.teamId === team.id);
          const completedTasks = teamTasksFromStore.filter(t => t.status === 'completed').length;
          const totalAmount = teamTasksFromStore.reduce((sum, task) => sum + (task.amount || 0), 0);
          const paidAmount = teamTasksFromStore.filter(t => t.isPaid).reduce((sum, task) => sum + (task.amount || 0), 0);
          
          return (
            <Card key={`team-${team.id}`} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    {team.name}
                  </CardTitle>
                  <Badge variant={team.activeTasks > 0 ? 'default' : 'secondary'}>
                    {team.activeTasks > 0 ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {team.specialty}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{team.membersCount}</div>
                      <div className="text-xs text-blue-600">Membres</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{teamTasksFromStore.length}</div>
                      <div className="text-xs text-orange-600">Tâches assignées</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Performance</span>
                      <span className={`text-sm font-semibold ${getPerformanceColor(team.performance)}`}>
                        {team.performance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          team.performance >= 90 ? 'bg-green-500' :
                          team.performance >= 75 ? 'bg-blue-500' :
                          team.performance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${team.performance}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tâches terminées:</span>
                      <span className="font-medium">{completedTasks}/{teamTasksFromStore.length}</span>
                    </div>
                    {totalAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Montant payé:</span>
                        <span className="font-medium text-green-600">
                          {Math.round((paidAmount / totalAmount) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Recent Tasks */}
                  {teamTasksFromStore.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Tâches récentes:</h4>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {teamTasksFromStore.slice(0, 3).map((task) => (
                          <div key={`task-recent-${task.id}`} className="text-xs p-2 bg-gray-50 rounded flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{task.name}</div>
                              <div className="text-gray-500">
                                {getVillaName(task.villaId)} • {getCategoryName(task.categoryId)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {task.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {task.status === 'in_progress' && <Clock className="h-3 w-3 text-blue-600" />}
                              {task.isReceived && <Badge variant="outline" className="text-xs">R</Badge>}
                              {task.isPaid && <Badge variant="outline" className="text-xs">P</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Dernière activité:</span>
                    <span className={activityStatus.color}>
                      {activityStatus.text}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setViewingTeam(team)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(team)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune équipe trouvée</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm ? 'Aucune équipe ne correspond à votre recherche.' : 'Commencez par créer votre première équipe.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une équipe
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={() => setEditingTeam(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'équipe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom de l'équipe</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-specialty">Spécialité</Label>
              <Input
                id="edit-specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-membersCount">Nombre de membres</Label>
              <Input
                id="edit-membersCount"
                type="number"
                value={formData.membersCount}
                onChange={(e) => setFormData({ ...formData, membersCount: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingTeam(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateTeam}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Team Dialog */}
      <Dialog 
        open={!!viewingTeam} 
        onOpenChange={(open) => {
          if (!open) setViewingTeam(null);
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Détails de l'équipe: {viewingTeam?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingTeam && (
            <div className="space-y-6">
              {/* Team Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Spécialité</Label>
                      <p className="text-lg font-semibold">{viewingTeam.specialty}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Membres</Label>
                      <p className="text-lg font-semibold">{viewingTeam.membersCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Tâches actives</Label>
                      <p className="text-lg font-semibold">{viewingTeam.activeTasks}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Performance</Label>
                      <p className="text-lg font-semibold">{viewingTeam.performance}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Tâches assignées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loadingTasks ? (
                      <p className="text-gray-500 text-center py-8">Chargement des tâches...</p>
                    ) : teamTasks.length === 0 ? (
                      <div>
                        <p className="text-gray-500 text-center py-4">Aucune tâche assignée</p>
                        <div className="flex justify-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fetchTeamTasks(viewingTeam.id)}
                            className="mt-2"
                          >
                            Rafraîchir les tâches
                          </Button>
                        </div>
                      </div>
                    ) : (
                      teamTasks.map((task) => (
                        <div key={`task-detail-${task.id}`} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{task.name}</h4>
                            <Badge variant={
                              task.status === 'completed' ? 'default' :
                              task.status === 'in_progress' ? 'secondary' :
                              task.status === 'delayed' ? 'destructive' : 'outline'
                            }>
                              {task.status === 'completed' ? 'Terminée' :
                               task.status === 'in_progress' ? 'En cours' :
                               task.status === 'delayed' ? 'En retard' : 'En attente'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Villa:</span>
                              <p className="font-medium">{getVillaName(task.villaId)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Catégorie:</span>
                              <p className="font-medium">{getCategoryName(task.categoryId)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Progression:</span>
                              <p className="font-medium">{task.progress}%</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Montant:</span>
                              <p className="font-medium">{task.amount ? `${task.amount.toLocaleString()} DH` : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className={`h-4 w-4 ${task.isReceived ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className="text-sm">Réceptionnée</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className={`h-4 w-4 ${task.isPaid ? 'text-green-600' : 'text-gray-400'}`} />
                              <span className="text-sm">Payée</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}