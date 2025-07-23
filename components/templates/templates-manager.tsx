'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Wrench, 
  Edit,
  Trash2,
  Eye,
  Copy,
  FileText,
  Users,
  ClipboardList
} from 'lucide-react';
import { Template } from '@/lib/types';

export function TemplatesManager() {
  const { templates, villas, addTemplate, updateTemplate, deleteTemplate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    categories: {
      name: string;
      teams: {
        name: string;
        specialty: string;
        tasks: {
          name: string;
          duration?: string;
          amount?: string;
        }[];
      }[];
    }[];
  }>({
    name: '',
    description: '',
    categories: [{ 
      name: '', 
      teams: [{ 
        name: '', 
        specialty: '', 
        tasks: [{ name: '', duration: '', amount: '' }] 
      }] 
    }]
  });

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    // Check if name is provided
    if (!formData.name.trim()) return false;
    
    // Check if at least one category is provided with name
    if (!formData.categories.length) return false;
    if (!formData.categories.every(cat => cat.name.trim())) return false;
    
    // Check if each category has at least one team with name and specialty
    if (!formData.categories.every(cat => 
      cat.teams.length && 
      cat.teams.every(team => team.name.trim() && team.specialty.trim())
    )) return false;
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTemplate: Template = {
      id: editingTemplate ? editingTemplate.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      categories: formData.categories.map(category => ({
        name: category.name,
        teams: category.teams.map(team => ({
          name: team.name,
          specialty: team.specialty,
          tasks: team.tasks.map(task => ({
            name: task.name,
            duration: task.duration,
            amount: task.amount
          }))
        }))
      })),
      createdAt: editingTemplate ? editingTemplate.createdAt : new Date()
    };

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, newTemplate);
    } else {
      addTemplate(newTemplate);
    }

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    updateTemplate(editingTemplate.id, {
      name: formData.name,
      description: formData.description,
      categories: formData.categories.map(category => ({
        name: category.name,
        teams: category.teams.map(team => ({
          name: team.name,
          specialty: team.specialty,
          tasks: team.tasks.map(task => ({
            name: task.name,
            duration: task.duration,
            amount: task.amount
          }))
        }))
      }))
    });

    setEditingTemplate(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categories: [{ 
        name: '', 
        teams: [{ 
          name: '', 
          specialty: '', 
          tasks: [{ name: '', duration: '', amount: '' }] 
        }] 
      }]
    });
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    const formattedCategories = template.categories.map(category => ({
      name: category.name,
      teams: category.teams.map(team => ({
        name: team.name,
        specialty: team.specialty,
        tasks: team.tasks.map(task => ({
          name: task.name,
          duration: task.duration || '',
          amount: task.amount || ''
        }))
      }))
    }));

    setFormData({
      name: template.name,
      description: template.description,
      categories: formattedCategories
    });
  };

  // Category functions
  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, { 
        name: '', 
        teams: [{ 
          name: '', 
          specialty: '', 
          tasks: [{ name: '', duration: '', amount: '' }] 
        }] 
      }]
    });
  };

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((_, i) => i !== index)
    });
  };

  const updateCategory = (index: number, field: string, value: string) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setFormData({ ...formData, categories: updatedCategories });
  };

  // Team functions
  const addTeam = (categoryIndex: number) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams.push({ 
      name: '', 
      specialty: '', 
      tasks: [{ name: '', duration: '' }] 
    });
    setFormData({ ...formData, categories: updatedCategories });
  };

  const removeTeam = (categoryIndex: number, teamIndex: number) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams = updatedCategories[categoryIndex].teams.filter((_, i) => i !== teamIndex);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const updateTeam = (categoryIndex: number, teamIndex: number, field: string, value: string) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams[teamIndex] = { 
      ...updatedCategories[categoryIndex].teams[teamIndex], 
      [field]: value 
    };
    setFormData({ ...formData, categories: updatedCategories });
  };

  // Task functions
  const addTask = (categoryIndex: number, teamIndex: number) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams[teamIndex].tasks.push({ name: '', duration: '', amount: '' });
    setFormData({ ...formData, categories: updatedCategories });
  };

  const removeTask = (categoryIndex: number, teamIndex: number, taskIndex: number) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams[teamIndex].tasks = 
      updatedCategories[categoryIndex].teams[teamIndex].tasks.filter((_, i) => i !== taskIndex);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const updateTask = (categoryIndex: number, teamIndex: number, taskIndex: number, field: string, value: string) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams[teamIndex].tasks[taskIndex] = {
      ...updatedCategories[categoryIndex].teams[teamIndex].tasks[taskIndex],
      [field]: value
    };
    setFormData({ ...formData, categories: updatedCategories });
  };

  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copie)`,
      createdAt: new Date()
    };
    addTemplate(newTemplate);
  };

  const getTotalTeams = (template: Template) => {
    return template.categories.reduce((total, cat) => total + (cat.teams?.length || 0), 0);
  };

  const getTotalTasks = (template: Template) => {
    return template.categories.reduce((total, cat) => 
      total + (cat.teams?.reduce((teamTotal, team) => teamTotal + (team.tasks?.length || 0), 0) || 0), 0
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Templates</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos modèles de projets</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer un nouveau template</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du template</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Villa Standard"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Template pour villa résidentielle"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Structure du template</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter catégorie
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {formData.categories.map((category, categoryIndex) => (
                    <Card key={`category-template-${categoryIndex}`} className="p-4 border-2 border-blue-200">
                      <div className="space-y-4">
                        {/* Category Header */}
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-5 w-5 text-blue-600" />
                          <Input
                            value={category.name}
                            onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                            placeholder="Nom de la catégorie (ex: Gros Œuvre)"
                            className="flex-1 font-medium"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCategory(categoryIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Teams Section */}
                        <div className="ml-6">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-md font-medium flex items-center">
                              <Users className="h-4 w-4 mr-2 text-green-600" />
                              Équipes
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTeam(categoryIndex)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Équipe
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            {category.teams.map((team, teamIndex) => (
                              <Card key={`team-template-${categoryIndex}-${teamIndex}`} className="p-3 border border-green-200 bg-green-50">
                                <div className="space-y-3">
                                  {/* Team Header */}
                                  <div className="flex items-center space-x-2">
                                    <div className="grid grid-cols-2 gap-2 flex-1">
                                      <Input
                                        value={team.name}
                                        onChange={(e) => updateTeam(categoryIndex, teamIndex, 'name', e.target.value)}
                                        placeholder="Nom de l'équipe (ex: Équipe Maçonnerie)"
                                        className="bg-white"
                                      />
                                      <Input
                                        value={team.specialty}
                                        onChange={(e) => updateTeam(categoryIndex, teamIndex, 'specialty', e.target.value)}
                                        placeholder="Spécialité (ex: Gros Œuvre)"
                                        className="bg-white"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeTeam(categoryIndex, teamIndex)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  {/* Tasks Section */}
                                  <div className="ml-4">
                                    <div className="flex items-center justify-between mb-2">
                                      <Label className="text-sm font-medium flex items-center">
                                        <ClipboardList className="h-3 w-3 mr-1 text-purple-600" />
                                        Tâches
                                      </Label>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addTask(categoryIndex, teamIndex)}
                                      >
                                        <Plus className="h-2 w-2 mr-1" />
                                        Tâche
                                      </Button>
                                    </div>
                                    <div className="space-y-2">
                                      {team.tasks.map((task, taskIndex) => (
                                        <div key={`task-template-${categoryIndex}-${teamIndex}-${taskIndex}`} className="space-y-2">
                                          <div className="flex items-center space-x-2">
                                            <Input
                                              value={task.name}
                                              onChange={(e) => updateTask(categoryIndex, teamIndex, taskIndex, 'name', e.target.value)}
                                              placeholder="Nom de la tâche"
                                              className="flex-1 bg-white text-sm"
                                            />
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => removeTask(categoryIndex, teamIndex, taskIndex)}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <div>
                                              <Label htmlFor={`task-duration-${categoryIndex}-${teamIndex}-${taskIndex}`} className="text-xs">Durée (jours)</Label>
                                              <Input
                                                id={`task-duration-${categoryIndex}-${teamIndex}-${taskIndex}`}
                                                type="number"
                                                min="1"
                                                placeholder="Ex: 7"
                                                value={task.duration}
                                                onChange={(e) => updateTask(categoryIndex, teamIndex, taskIndex, 'duration', e.target.value)}
                                                className="h-8"
                                              />
                                            </div>
                                            <div>
                                              <Label htmlFor={`task-amount-${categoryIndex}-${teamIndex}-${taskIndex}`} className="text-xs">Montant (DH)</Label>
                                              <Input
                                                id={`task-amount-${categoryIndex}-${teamIndex}-${taskIndex}`}
                                                type="number"
                                                placeholder="Ex: 5000"
                                                value={task.amount}
                                                onChange={(e) => updateTask(categoryIndex, teamIndex, taskIndex, 'amount', e.target.value)}
                                                className="h-8"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={(e) => handleSubmit(e)}>
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
          placeholder="Rechercher un template..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  {template.name}
                </CardTitle>
                <div className="flex space-x-1">
                  <Badge variant="outline">
                    {template.categories.length} catégories
                  </Badge>
                  <Badge variant="outline">
                    {getTotalTeams(template)} équipes
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Structure incluse:</h4>
                  <div className="space-y-2">
                    {template.categories.slice(0, 2).map((category, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-blue-700">• {category.name}</div>
                        {category.teams && category.teams.slice(0, 2).map((team, teamIndex) => (
                          <div key={teamIndex} className="ml-4 text-gray-600">
                            ◦ {team.name} ({team.tasks?.length || 0} tâches)
                          </div>
                        ))}
                        {category.teams && category.teams.length > 2 && (
                          <div className="ml-4 text-gray-500 text-xs">
                            +{category.teams.length - 2} autres équipes
                          </div>
                        )}
                      </div>
                    ))}
                    {template.categories.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{template.categories.length - 2} autres catégories
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-blue-50 p-2 rounded">
                    <div className="font-bold text-blue-600">{template.categories.length}</div>
                    <div className="text-blue-600">Catégories</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <div className="font-bold text-green-600">{getTotalTeams(template)}</div>
                    <div className="text-green-600">Équipes</div>
                  </div>
                  <div className="bg-purple-50 p-2 rounded">
                    <div className="font-bold text-purple-600">{getTotalTasks(template)}</div>
                    <div className="text-purple-600">Tâches</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Créé le {template.createdAt.toLocaleDateString()}
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setViewingTemplate(template)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun template trouvé</h3>
            <p className="text-gray-600 text-center mb-4">
              {searchTerm ? 'Aucun template ne correspond à votre recherche.' : 'Commencez par créer votre premier template.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un template
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* View Template Dialog */}
      <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {viewingTemplate?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingTemplate && (
            <div className="space-y-4">
              <p className="text-gray-600">{viewingTemplate.description}</p>
              
              <div>
                <h4 className="font-semibold mb-3">Structure complète:</h4>
                <div className="space-y-4">
                  {viewingTemplate.categories.map((category, categoryIndex) => (
                    <Card key={categoryIndex} className="p-4 border-l-4 border-l-blue-500">
                      <h5 className="font-medium mb-3 flex items-center">
                        <Wrench className="h-4 w-4 mr-2 text-blue-600" />
                        {category.name}
                      </h5>
                      
                      {category.teams && category.teams.length > 0 ? (
                        <div className="space-y-3 ml-4">
                          {category.teams.map((team, teamIndex) => (
                            <Card key={teamIndex} className="p-3 bg-green-50 border-green-200">
                              <h6 className="font-medium mb-2 flex items-center">
                                <Users className="h-3 w-3 mr-2 text-green-600" />
                                {team.name} - {team.specialty}
                              </h6>
                              
                              {team.tasks && team.tasks.length > 0 && (
                                <div className="ml-4">
                                  <p className="text-sm font-medium mb-1 flex items-center">
                                    <ClipboardList className="h-3 w-3 mr-1 text-purple-600" />
                                    Tâches:
                                  </p>
                                  <div className="space-y-1">
                                    {team.tasks.map((task, taskIndex) => (
                                      <div key={taskIndex} className="text-sm text-gray-600 flex items-center">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                        {task.name}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 ml-4">Aucune équipe définie</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le template</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nom du template</Label>
                <Button
                  type="submit"
                  onClick={(e) => handleSubmit(e)}
                  disabled={!formData.name.trim() || !formData.description.trim()}
                >
                  Créer
                </Button>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Structure du template</Label>
                <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter catégorie
                </Button>
              </div>
              
              <div className="space-y-6">
                {formData.categories.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="p-4 border-2 border-blue-200">
                    <div className="space-y-4">
                      {/* Category Header */}
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-5 w-5 text-blue-600" />
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                          placeholder="Nom de la catégorie"
                          className="flex-1 font-medium"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCategory(categoryIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Teams Section */}
                      <div className="ml-6">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-md font-medium flex items-center">
                            <Users className="h-4 w-4 mr-2 text-green-600" />
                            Équipes
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addTeam(categoryIndex)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Équipe
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {category.teams.map((team, teamIndex) => (
                            <Card key={teamIndex} className="p-3 border border-green-200 bg-green-50">
                              <div className="space-y-3">
                                {/* Team Header */}
                                <div className="flex items-center space-x-2">
                                  <div className="grid grid-cols-2 gap-2 flex-1">
                                    <Input
                                      value={team.name}
                                      onChange={(e) => updateTeam(categoryIndex, teamIndex, 'name', e.target.value)}
                                      placeholder="Nom de l'équipe"
                                      className="bg-white"
                                    />
                                    <Input
                                      value={team.specialty}
                                      onChange={(e) => updateTeam(categoryIndex, teamIndex, 'specialty', e.target.value)}
                                      placeholder="Spécialité"
                                      className="bg-white"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeTeam(categoryIndex, teamIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {/* Tasks Section */}
                                <div className="ml-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <Label className="text-sm font-medium flex items-center">
                                      <ClipboardList className="h-3 w-3 mr-1 text-purple-600" />
                                      Tâches
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addTask(categoryIndex, teamIndex)}
                                    >
                                      <Plus className="h-2 w-2 mr-1" />
                                      Tâche
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {team.tasks.map((task, taskIndex) => (
                                      <div key={taskIndex} className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Input
                                            value={task.name}
                                            onChange={(e) => updateTask(categoryIndex, teamIndex, taskIndex, 'name', e.target.value)}
                                            placeholder="Nom de la tâche"
                                            className="flex-1"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeTask(categoryIndex, teamIndex, taskIndex)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <Label htmlFor={`task-duration-${categoryIndex}-${teamIndex}-${taskIndex}`} className="text-xs">Durée (jours)</Label>
                                            <Input
                                              id={`task-duration-${categoryIndex}-${teamIndex}-${taskIndex}`}
                                              type="number"
                                              min="1"
                                              placeholder="Ex: 7"
                                              value={task.duration}
                                              onChange={(e) => updateTask(categoryIndex, teamIndex, taskIndex, 'duration', e.target.value)}
                                              className="h-8"
                                            />
                                          </div>
                                          <div>
                                            <Label htmlFor={`task-amount-${categoryIndex}-${teamIndex}-${taskIndex}`} className="text-xs">Montant (DH)</Label>
                                            <Input
                                              id={`task-amount-${categoryIndex}-${teamIndex}-${taskIndex}`}
                                              type="number"
                                              placeholder="Ex: 5000"
                                              value={task.amount}
                                              onChange={(e) => updateTask(categoryIndex, teamIndex, taskIndex, 'amount', e.target.value)}
                                              className="h-8"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateTemplate}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}