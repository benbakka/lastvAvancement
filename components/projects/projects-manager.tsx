'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Project } from '@/lib/types';

export function ProjectsManager() {
  const { projects, villas, addProject, updateProject, deleteProject, setSelectedProject, setLoading } = useStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      const projectData = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        status: 'ACTIVE' as 'ACTIVE' | 'COMPLETED' | 'PAUSED',
        progress: 0,
        villasCount: 0,
        alertsCount: 0
      };

      // Call the API to create the project
      const createdProject = await apiService.createProject(projectData);
      
      // Add the created project to the store with proper date objects
      addProject({
        ...createdProject,
        startDate: new Date(createdProject.startDate),
        endDate: new Date(createdProject.endDate)
      });
      
      toast({
        title: 'Projet créé',
        description: 'Le projet a été créé avec succès.',
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le projet.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    try {
      setLoading(true);
      const projectUpdates = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate)
      };

      // Call the API to update the project
      const updatedProject = await apiService.updateProject(editingProject.id, projectUpdates);
      
      // Update the project in the store with proper date objects
      updateProject(editingProject.id, {
        ...updatedProject,
        startDate: new Date(updatedProject.startDate),
        endDate: new Date(updatedProject.endDate)
      });
      
      toast({
        title: 'Projet mis à jour',
        description: 'Le projet a été mis à jour avec succès.',
      });
      
      setEditingProject(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update project:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le projet.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      type: project.type,
      location: project.location,
      startDate: project.startDate.toISOString().split('T')[0],
      endDate: project.endDate.toISOString().split('T')[0],
      description: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'COMPLETED': return 'Terminé';
      case 'PAUSED': return 'En pause';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Projets</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos projets de construction</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau projet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du projet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Résidence Les Oliviers"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Résidentiel, Commercial"
                />
              </div>
              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Casablanca, Rabat"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateProject}>
                  Créer
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
          placeholder="Rechercher un projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <Card key={`project-list-${project.id}-${index}-${Math.random().toString(36).substring(2, 9)}`} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {project.type}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {project.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {project.startDate.toLocaleDateString()} - {project.endDate.toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Avancement</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>{project.villasCount} villas</span>
                  {project.alertsCount > 0 && (
                    <div className="flex items-center text-red-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {project.alertsCount} alertes
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setViewingProject(project)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        // Call the API to delete the project
                        await apiService.deleteProject(project.id);
                        // Remove from local state
                        deleteProject(project.id);
                        toast({
                          title: 'Projet supprimé',
                          description: 'Le projet a été supprimé avec succès.',
                        });
                      } catch (error) {
                        console.error('Failed to delete project:', error);
                        toast({
                          title: 'Erreur',
                          description: 'Impossible de supprimer le projet.',
                          variant: 'destructive'
                        });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet trouvé</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm ? 'Aucun projet ne correspond à votre recherche.' : 'Commencez par créer votre premier projet.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un projet
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom du projet</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Type</Label>
              <Input
                id="edit-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Localisation</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-startDate">Date de début</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-endDate">Date de fin</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingProject(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateProject}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={!!viewingProject} onOpenChange={() => setViewingProject(null)}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Détails du projet: {viewingProject?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingProject && (
            <div className="space-y-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <p className="text-lg font-semibold">{viewingProject.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Localisation</Label>
                      <p className="text-lg font-semibold flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {viewingProject.location}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Statut</Label>
                      <Badge className={getStatusColor(viewingProject.status)}>
                        {getStatusText(viewingProject.status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Avancement</Label>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">{viewingProject.progress}%</p>
                        <Progress value={viewingProject.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date de début</Label>
                      <p className="text-lg font-semibold flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {viewingProject.startDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date de fin</Label>
                      <p className="text-lg font-semibold flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {viewingProject.endDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{viewingProject.villasCount}</div>
                      <div className="text-sm text-blue-600">Villas totales</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {villas.filter(v => v.projectId === viewingProject.id && v.status === 'completed').length}
                      </div>
                      <div className="text-sm text-green-600">Villas terminées</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">
                        {villas.filter(v => v.projectId === viewingProject.id && v.status === 'in_progress').length}
                      </div>
                      <div className="text-sm text-orange-600">Villas en cours</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">{viewingProject.alertsCount}</div>
                      <div className="text-sm text-red-600">Alertes actives</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Villas */}
              <Card>
                <CardHeader>
                  <CardTitle>Villas du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {villas.filter(v => v.projectId === viewingProject.id).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune villa dans ce projet</p>
                    ) : (
                      villas.filter(v => v.projectId === viewingProject.id).map((villa) => (
                        <div key={`villa-${villa.id}`} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{villa.name}</h4>
                            <Badge className={getStatusColor(villa.status)}>
                              {getStatusText(villa.status)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <p className="font-medium">{villa.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Surface:</span>
                              <p className="font-medium">{villa.surface}m²</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Catégories:</span>
                              <p className="font-medium">{villa.categoriesCount}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Tâches:</span>
                              <p className="font-medium">{villa.tasksCount}</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Avancement</span>
                              <span>{villa.progress}%</span>
                            </div>
                            <Progress value={villa.progress} className="h-2" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedProject(viewingProject)}
                >
                  Sélectionner ce projet
                </Button>
                <Button onClick={() => setViewingProject(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}