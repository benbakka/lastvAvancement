'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Building2, 
  Edit,
  Trash2,
  Eye,
  Filter,
  Home,
  Loader2
} from 'lucide-react';
import { Villa } from '@/lib/types';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function VillasManager() {
  const { 
    selectedProject, 
    villas, 
    templates,
    categories,
    tasks,
    addVilla, 
    updateVilla, 
    deleteVilla,
    getVillasByProject,
    setLoading
  } = useStore();
  
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVilla, setEditingVilla] = useState<Villa | null>(null);
  const [viewingVilla, setViewingVilla] = useState<Villa | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    surface: '',
    templateId: ''
  });

  // Ensure we're comparing string IDs consistently as per project memory
  const projectVillas = selectedProject ? getVillasByProject(selectedProject.id.toString()) : [];
  console.log('Selected Project:', selectedProject);
  console.log('Project ID (string):', selectedProject?.id.toString());
  console.log('Project Villas found:', projectVillas.length);
  console.log('All Villas in Store:', villas.length);
  console.log('All Villas details:', villas);
  
  // Debug each villa's projectId to see if they match the selected project
  if (selectedProject) {
    console.log('Debugging villa project associations:');
    villas.forEach(villa => {
      console.log(`Villa ${villa.id} (${villa.name}) has projectId: ${villa.projectId} | Selected project: ${selectedProject.id.toString()} | Match: ${villa.projectId === selectedProject.id.toString()}`);
    });
  }
  
  // Debug villa statuses before filtering
  console.log('Status filter value:', statusFilter);
  console.log('Villa statuses before filtering:', projectVillas.map(v => ({ id: v.id, name: v.name, status: v.status })));
  
  const filteredVillas = projectVillas.filter(villa => {
    // Ensure case-insensitive text search
    const matchesSearch = villa.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         villa.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Ensure status comparison works correctly
    const matchesStatus = statusFilter === 'all' || villa.status === statusFilter;
    
    // Debug each villa's filtering
    console.log(`Villa ${villa.id} (${villa.name}) - search match: ${matchesSearch}, status match: ${matchesStatus}`);
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateVilla = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      
      // Format the data for the backend
      // The backend expects a Project object with an id, not just a projectId
      const villaData = {
        project: {
          id: parseInt(selectedProject.id) // Convert string ID to number for backend
        },
        name: formData.name,
        type: formData.type,
        surface: parseInt(formData.surface),
        progress: 0,
        status: 'NOT_STARTED', // Backend uses uppercase enum values
        categoriesCount: 0,
        tasksCount: 0
        // Backend will set lastModified automatically via @PrePersist
      };

      console.log('Sending villa data to backend:', villaData);
      
      // Call the API to create the villa
      const createdVilla = await apiService.createVilla(villaData);
      console.log('Received created villa from backend:', createdVilla);
      
      // Add the created villa to the store with proper date objects and format
      addVilla({
        id: createdVilla.id.toString(), // Convert numeric ID to string for frontend
        projectId: selectedProject.id,
        name: createdVilla.name,
        type: createdVilla.type,
        surface: createdVilla.surface,
        progress: createdVilla.progress,
        // Convert backend enum to frontend format
        status: createdVilla.status.toLowerCase() as 'not_started' | 'in_progress' | 'completed' | 'delayed',
        categoriesCount: createdVilla.categoriesCount,
        tasksCount: createdVilla.tasksCount,
        lastModified: createdVilla.lastModified ? new Date(createdVilla.lastModified) : new Date()
      });
      
      toast({
        title: 'Villa créée',
        description: 'La villa a été créée avec succès.',
      });
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create villa:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la villa.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVilla = async () => {
    if (!editingVilla) return;
    
    try {
      setLoading(true);
      
      // Format the data for the backend
      // The backend expects a Project object with an id, not just a projectId
      const villaData = {
        project: {
          id: parseInt(editingVilla.projectId) // Convert string ID to number for backend
        },
        name: formData.name,
        type: formData.type,
        surface: parseInt(formData.surface),
        progress: editingVilla.progress,
        // Convert frontend status format to backend enum format
        status: editingVilla.status.toUpperCase().replace(/-/g, '_'),
        categoriesCount: editingVilla.categoriesCount,
        tasksCount: editingVilla.tasksCount
        // Backend will set lastModified automatically via @PreUpdate
      };

      console.log('Sending villa update data to backend:', villaData);
      
      // Call the API to update the villa
      const updatedVilla = await apiService.updateVilla(editingVilla.id, villaData);
      console.log('Received updated villa from backend:', updatedVilla);
      
      // Update the villa in the store with proper date objects and format
      updateVilla(editingVilla.id, {
        id: updatedVilla.id.toString(), // Convert numeric ID to string for frontend
        projectId: editingVilla.projectId,
        name: updatedVilla.name,
        type: updatedVilla.type,
        surface: updatedVilla.surface,
        progress: updatedVilla.progress,
        // Convert backend enum to frontend format
        status: updatedVilla.status.toLowerCase() as 'not_started' | 'in_progress' | 'completed' | 'delayed',
        categoriesCount: updatedVilla.categoriesCount,
        tasksCount: updatedVilla.tasksCount,
        lastModified: updatedVilla.lastModified ? new Date(updatedVilla.lastModified) : new Date()
      });
      
      toast({
        title: 'Villa mise à jour',
        description: 'La villa a été mise à jour avec succès.',
      });
      
      setEditingVilla(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update villa:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la villa.',
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
      surface: '',
      templateId: ''
    });
    setSelectedTemplate('');
  };

  const openEditDialog = (villa: Villa) => {
    setEditingVilla(villa);
    setFormData({
      name: villa.name,
      type: villa.type,
      surface: villa.surface.toString(),
      templateId: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'delayed': return 'En retard';
      case 'not_started': return 'Non démarrée';
      default: return status;
    }
  };

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet sélectionné</h3>
          <p className="text-gray-600 text-center">
            Sélectionnez un projet dans la barre de navigation pour gérer ses villas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Villas</h1>
          <p className="text-gray-600 mt-1">
            Projet: <span className="font-semibold">{selectedProject.name}</span>
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle Villa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle villa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la villa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Villa A1"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ex: Villa Type A"
                />
              </div>
              <div>
                <Label htmlFor="surface">Surface (m²)</Label>
                <Input
                  id="surface"
                  type="number"
                  value={formData.surface}
                  onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                  placeholder="Ex: 250"
                />
              </div>
              <div>
                <Label htmlFor="template">Template (optionnel)</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={`template-${template.id}`} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateVilla}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une villa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="not_started">Non démarrée</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="completed">Terminée</SelectItem>
            <SelectItem value="delayed">En retard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{projectVillas.length}</div>
              <div className="text-sm text-gray-600">Total villas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {projectVillas.filter(v => v.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Terminées</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {/* Debug status values rendered outside JSX */}
              <div className="text-2xl font-bold text-blue-600">
                {projectVillas.filter(v => v.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {projectVillas.filter(v => v.status === 'delayed').length}
              </div>
              <div className="text-sm text-gray-600">En retard</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Villas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVillas.map((villa) => (
          <Card key={`villa-${villa.id}`} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  {villa.name}
                </CardTitle>
                <Badge className={getStatusColor(villa.status)}>
                  {getStatusText(villa.status)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                {villa.type} • {villa.surface}m²
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Avancement</span>
                    <span>{villa.progress}%</span>
                  </div>
                  <Progress value={villa.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Catégories:</span>
                    <div className="font-semibold">{villa.categoriesCount}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Tâches:</span>
                    <div className="font-semibold">{villa.tasksCount}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Modifié le {villa.lastModified.toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setViewingVilla(villa)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(villa)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteVilla(villa.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVillas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Home className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune villa trouvée</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucune villa ne correspond à vos critères de recherche.' 
                : 'Commencez par créer votre première villa.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer une villa
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingVilla} onOpenChange={() => setEditingVilla(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la villa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom de la villa</Label>
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
              <Label htmlFor="edit-surface">Surface (m²)</Label>
              <Input
                id="edit-surface"
                type="number"
                value={formData.surface}
                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingVilla(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateVilla}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Villa Dialog */}
      <Dialog open={!!viewingVilla} onOpenChange={() => setViewingVilla(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Détails de la villa: {viewingVilla?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingVilla && (
            <div className="space-y-6">
              {/* Villa Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <p className="text-lg font-semibold">{viewingVilla.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Surface</Label>
                      <p className="text-lg font-semibold">{viewingVilla.surface}m²</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Statut</Label>
                      <Badge className={getStatusColor(viewingVilla.status)}>
                        {getStatusText(viewingVilla.status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Avancement</Label>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">{viewingVilla.progress}%</p>
                        <Progress value={viewingVilla.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Villa Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Catégories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.filter(c => c.villaId === viewingVilla.id).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">Aucune catégorie définie</p>
                    ) : (
                      categories.filter(c => c.villaId === viewingVilla.id).map((category) => (
                        <div key={`category-${category.id}`} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{category.name}</h4>
                            <Badge variant="outline">
                              {category.progress}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Début:</span>
                              <p className="font-medium">{category.startDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Fin:</span>
                              <p className="font-medium">{category.endDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Tâches:</span>
                              <p className="font-medium">{category.completedTasks}/{category.tasksCount}</p>
                            </div>
                          </div>
                          <Progress value={category.progress} className="h-2 mt-2" />
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Villa Tasks Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Résumé des tâches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{viewingVilla.tasksCount}</div>
                      <div className="text-sm text-blue-600">Total tâches</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {tasks.filter(t => t.villaId === viewingVilla.id && t.status === 'completed').length}
                      </div>
                      <div className="text-sm text-green-600">Terminées</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {tasks.filter(t => t.villaId === viewingVilla.id && t.status === 'in_progress').length}
                      </div>
                      <div className="text-sm text-orange-600">En cours</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {tasks.filter(t => t.villaId === viewingVilla.id && t.status === 'delayed').length}
                      </div>
                      <div className="text-sm text-red-600">En retard</div>
                    </div>
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