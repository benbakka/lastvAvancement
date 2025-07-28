'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  Wrench,
  Edit,
  Trash2,
  Eye,
  Copy,
  FileText,
  Users,
  ClipboardList,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  X
} from 'lucide-react';
import { Template } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

// Helper function to calculate progress status based on planned dates and progress
const calculateProgressStatus = (
  plannedStartDate: string | undefined,
  plannedEndDate: string | undefined,
  progress: number
): 'on_schedule' | 'ahead' | 'behind' | 'at_risk' => {
  if (!plannedStartDate || !plannedEndDate) return 'on_schedule';

  const now = new Date();
  const start = new Date(plannedStartDate);
  const end = new Date(plannedEndDate);

  // If task hasn't started yet (per plan)
  if (now < start) {
    return progress > 0 ? 'ahead' : 'on_schedule';
  }

  // If task is past end date
  if (now > end) {
    return progress === 100 ? 'on_schedule' : 'at_risk';
  }

  // During scheduled period - calculate expected progress based on elapsed time
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = now.getTime() - start.getTime();
  const expectedProgress = Math.min(100, Math.round((elapsedDuration / totalDuration) * 100));

  // Determine status based on difference between actual and expected progress
  const diff = progress - expectedProgress;

  if (diff >= 10) return 'ahead';
  if (diff <= -20) return 'at_risk';
  if (diff < 0) return 'behind';
  return 'on_schedule';
};

// Helper function to update status based on progress
const getStatusFromProgress = (progress: number): 'pending' | 'in_progress' | 'completed' | 'delayed' => {
  if (progress === 100) return 'completed';
  if (progress > 0) return 'in_progress';
  return 'pending';
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'delayed':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Helper function to get progress status color
const getProgressStatusColor = (status: string): string => {
  switch (status) {
    case 'ahead':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'on_schedule':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'behind':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'at_risk':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

interface TaskFormType {
  name: string;
  description: string;
  teamId?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  duration: string;
  amount: string;
  progress: number;
  progressStatus: 'on_schedule' | 'ahead' | 'behind' | 'at_risk';
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  remarks?: string;
  isReceived: boolean;
  isPaid: boolean;
}

interface TeamFormType {
  name: string;
  specialty: string;
  tasks: TaskFormType[];
}

interface CategoryFormType {
  name: string;
  startDate: string;
  endDate: string;
  teams: TeamFormType[];
}

interface TemplateFormType {
  name: string;
  description: string;
  categories: CategoryFormType[];
}

export function TemplatesManager() {
  const { templates, villas, addTemplate, updateTemplate, deleteTemplate } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [formData, setFormData] = useState<TemplateFormType>({
    name: '',
    description: '',
    categories: [{
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      teams: [{
        name: '',
        specialty: '',
        tasks: [{
          name: '',
          description: '',
          duration: '',
          amount: '',
          plannedStartDate: new Date().toISOString().split('T')[0],
          plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          actualStartDate: new Date().toISOString().split('T')[0],
          actualEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          progress: 0,
          progressStatus: 'on_schedule' as const,
          status: 'pending' as const,
          isReceived: false,
          isPaid: false,
          remarks: ''
        }]
      }]
    }]
  });

  // State for task editing dialog
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(0);
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [editingTask, setEditingTask] = useState<boolean>(false);

  // Task form data for the dialog
  const [taskFormData, setTaskFormData] = useState<TaskFormType>({
    name: '',
    description: '',
    duration: '',
    amount: '',
    plannedStartDate: new Date().toISOString().split('T')[0],
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actualStartDate: new Date().toISOString().split('T')[0],
    actualEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 0,
    progressStatus: 'on_schedule',
    status: 'pending',
    isReceived: false,
    isPaid: false,
    remarks: ''
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

  // Open edit dialog for template editing
  const openEditDialog = (template: Template) => {
    // Map Template to TemplateFormType with all detailed fields
    const formattedTemplate: TemplateFormType = {
      name: template.name,
      description: template.description,
      categories: template.categories.map(category => ({
        name: category.name,
        startDate: new Date().toISOString().split('T')[0], // Default if not present
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default if not present
        teams: category.teams.map(team => ({
          name: team.name,
          specialty: team.specialty || '',
          tasks: team.tasks.map(task => ({
            name: task.name,
            description: task.description || '',
            duration: task.duration || '',
            amount: task.amount || '',
            plannedStartDate: task.plannedStartDate || new Date().toISOString().split('T')[0],
            plannedEndDate: task.plannedEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            actualStartDate: task.actualStartDate || new Date().toISOString().split('T')[0],
            actualEndDate: task.actualEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: task.progress || 0,
            progressStatus: task.progressStatus || 'on_schedule',
            status: task.status || 'pending',
            remarks: task.remarks || '',
            isReceived: task.isReceived || false,
            isPaid: task.isPaid || false
          }))
        }))
      }))
    };

    setFormData(formattedTemplate);
    setEditingTemplateId(template.id);
  };

  // Function to handle template deletion with confirmation - defined once

  // This function is now replaced by the handleSubmit function
  // Keeping it for backward compatibility with existing code
  const handleUpdateTemplate = () => {
    // Just call handleSubmit with a synthetic event
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categories: [{
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        teams: [{
          name: '',
          specialty: '',
          tasks: [{
            name: '',
            description: '',
            duration: '',
            amount: '',
            plannedStartDate: new Date().toISOString().split('T')[0],
            plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            actualStartDate: new Date().toISOString().split('T')[0],
            actualEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            progressStatus: 'on_schedule' as const,
            status: 'pending' as const,
            isReceived: false,
            isPaid: false,
            remarks: ''
          }]
        }]
      }]
    });
  };

  // Function to duplicate a template
  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copie)`,
      createdAt: new Date()
    };
    addTemplate(newTemplate);
    toast({
      title: "Succès",
      description: "Le template a été dupliqué avec succès"
    });
  };

  // Function to get total teams in a template
  const getTotalTeams = (template: Template): number => {
    return template.categories.reduce((total, category) => total + category.teams.length, 0);
  };

  // Function to get total tasks in a template
  const getTotalTasks = (template: Template): number => {
    return template.categories.reduce((categoryTotal, category) => {
      return categoryTotal + category.teams.reduce((teamTotal, team) => {
        return teamTotal + (team.tasks?.length || 0);
      }, 0);
    }, 0);
  };

  // Function to delete template with confirmation
  const deleteTemplateWithConfirmation = (template: Template | string) => {
    if (typeof template === 'string') {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
        deleteTemplate(template);
        toast({
          title: "Succès",
          description: "Le template a été supprimé avec succès"
        });
      }
    } else {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.name}" ?`)) {
        deleteTemplate(template.id);
        toast({
          title: 'Template supprimé',
          description: `Le template ${template.name} a été supprimé avec succès.`
        });
      }
    }
  };

  // Category functions
  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [...formData.categories, {
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        teams: [{
          name: '',
          specialty: '',
          tasks: [{
            name: '',
            description: '',
            duration: '',
            amount: '',
            plannedStartDate: new Date().toISOString().split('T')[0],
            plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            actualStartDate: new Date().toISOString().split('T')[0],
            actualEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            progress: 0,
            progressStatus: 'on_schedule' as const,
            status: 'pending' as const,
            isReceived: false,
            isPaid: false,
            remarks: ''
          }]
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
      tasks: [{
        name: '',
        description: '',
        duration: '',
        amount: '',
        plannedStartDate: new Date().toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualStartDate: new Date().toISOString().split('T')[0],
        actualEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        progress: 0,
        progressStatus: 'on_schedule' as const,
        status: 'pending' as const,
        isReceived: false,
        isPaid: false,
        remarks: ''
      }]
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
    updatedCategories[categoryIndex].teams[teamIndex].tasks.push({
      name: '',
      description: '',
      duration: '',
      amount: '',
      plannedStartDate: new Date().toISOString().split('T')[0],
      plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      actualStartDate: new Date().toISOString().split('T')[0],
      actualEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      progressStatus: 'on_schedule' as const,
      status: 'pending' as const,
      isReceived: false,
      isPaid: false,
      remarks: ''
    });
    setFormData({ ...formData, categories: updatedCategories });
  };

  const removeTask = (categoryIndex: number, teamIndex: number, taskIndex: number) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams[teamIndex].tasks =
      updatedCategories[categoryIndex].teams[teamIndex].tasks.filter((_, i) => i !== taskIndex);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const updateTask = (categoryIndex: number, teamIndex: number, taskIndex: number, field: string, value: string | number | boolean) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[categoryIndex].teams[teamIndex].tasks[taskIndex] = {
      ...updatedCategories[categoryIndex].teams[teamIndex].tasks[taskIndex],
      [field]: value
    };

    // If updating progress, automatically update progress status and task status
    if (field === 'progress') {
      const task = updatedCategories[categoryIndex].teams[teamIndex].tasks[taskIndex];
      const progressValue = value as number;

      // Update task status based on progress
      task.status = getStatusFromProgress(progressValue);

      // Update progress status based on planned dates and progress
      task.progressStatus = calculateProgressStatus(
        task.plannedStartDate,
        task.plannedEndDate,
        progressValue
      );
    }

    setFormData({ ...formData, categories: updatedCategories });
  };

  // Task dialog functions
  const openTaskDialog = (categoryIndex: number, teamIndex: number, taskIndex?: number) => {
    setCurrentCategoryIndex(categoryIndex);
    setCurrentTeamIndex(teamIndex);

    if (taskIndex !== undefined) {
      // Editing existing task
      setCurrentTaskIndex(taskIndex);
      setEditingTask(true);
      const task = formData.categories[categoryIndex].teams[teamIndex].tasks[taskIndex];
      setTaskFormData({
        name: task.name,
        description: task.description,
        duration: task.duration,
        amount: task.amount,
        plannedStartDate: task.plannedStartDate,
        plannedEndDate: task.plannedEndDate,
        actualStartDate: task.actualStartDate || '',
        actualEndDate: task.actualEndDate || '',
        progress: task.progress,
        progressStatus: task.progressStatus,
        status: task.status,
        isReceived: task.isReceived,
        isPaid: task.isPaid,
        remarks: task.remarks || ''
      });
    } else {
      // Creating new task
      setEditingTask(false);
      setTaskFormData({
        name: '',
        description: '',
        duration: '',
        amount: '',
        plannedStartDate: new Date().toISOString().split('T')[0],
        plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualStartDate: '',
        actualEndDate: '',
        progress: 0,
        progressStatus: 'on_schedule',
        status: 'pending',
        isReceived: false,
        isPaid: false,
        remarks: ''
      });
    }

    setIsTaskDialogOpen(true);
  };

  const handleTaskSubmit = () => {
    if (!taskFormData.name) {
      toast({
        title: "Erreur",
        description: "Le nom de la tâche est requis",
        variant: "destructive"
      });
      return;
    }

    const updatedCategories = [...formData.categories];

    if (editingTask) {
      // Update existing task
      updatedCategories[currentCategoryIndex].teams[currentTeamIndex].tasks[currentTaskIndex] = {
        ...taskFormData
      };
    } else {
      // Add new task
      updatedCategories[currentCategoryIndex].teams[currentTeamIndex].tasks.push({
        ...taskFormData
      });
    }

    setFormData({
      ...formData,
      categories: updatedCategories
    });

    setIsTaskDialogOpen(false);
  };

  const handleTaskProgressChange = (value: number) => {
    // Update progress
    setTaskFormData(prev => {
      const updated = { ...prev, progress: value };

      // Update status based on progress
      updated.status = getStatusFromProgress(value);

      // Update progress status based on planned dates and progress
      updated.progressStatus = calculateProgressStatus(
        updated.plannedStartDate,
        updated.plannedEndDate,
        value
      );

      return updated;
    });
  };

  // Handle template form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du template est requis",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erreur",
        description: "La description du template est requise",
        variant: "destructive"
      });
      return;
    }

    // Validate categories
    if (formData.categories.length === 0) {
      toast({
        title: "Erreur",
        description: "Vous devez ajouter au moins une catégorie",
        variant: "destructive"
      });
      return;
    }

    // Check for empty category names
    const hasEmptyCategory = formData.categories.some(cat => !cat.name.trim());
    if (hasEmptyCategory) {
      toast({
        title: "Erreur",
        description: "Toutes les catégories doivent avoir un nom",
        variant: "destructive"
      });
      return;
    }

    // Map detailed form data to simplified Template type
    const templateData: Template = {
      id: editingTemplateId || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      createdAt: new Date(),
      categories: formData.categories.map(category => ({
        name: category.name,
        teams: category.teams.map(team => ({
          name: team.name,
          specialty: team.specialty,
          tasks: team.tasks.map(task => ({
            name: task.name,
            duration: task.duration,
            amount: task.amount,
            // Store all detailed fields as well for when template is applied
            description: task.description,
            plannedStartDate: task.plannedStartDate,
            plannedEndDate: task.plannedEndDate,
            actualStartDate: task.actualStartDate,
            actualEndDate: task.actualEndDate,
            progress: task.progress,
            progressStatus: task.progressStatus,
            status: task.status,
            remarks: task.remarks,
            isReceived: task.isReceived,
            isPaid: task.isPaid
          }))
        }))
      }))
    };

    if (editingTemplateId) {
      // Update existing template
      updateTemplate(templateData.id, templateData);
      toast({
        title: "Succès",
        description: "Le template a été mis à jour avec succès"
      });
    } else {
      // Create new template
      addTemplate(templateData);
      toast({
        title: "Succès",
        description: "Le template a été créé avec succès"
      });
    }

    // Reset form and close dialog
    resetForm();
    setEditingTemplateId(null);
    setIsCreateDialogOpen(false);
  };

  // Function to view template details
  const viewTemplate = (template: Template) => {
    setViewingTemplate(template);
  }; 

  return (
    
    <div className="space-y-6">

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Modifier la tâche' : 'Ajouter une tâche'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskName" className="text-right">
                Nom *
              </Label>
              <Input
                id="taskName"
                value={taskFormData.name}
                onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="taskDescription"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskDuration" className="text-right">
                Durée
              </Label>
              <Input
                id="taskDuration"
                value={taskFormData.duration}
                onChange={(e) => setTaskFormData({ ...taskFormData, duration: e.target.value })}
                className="col-span-3"
                placeholder="ex: 5 jours"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="taskAmount" className="text-right">
                Montant
              </Label>
              <Input
                id="taskAmount"
                value={taskFormData.amount}
                onChange={(e) => setTaskFormData({ ...taskFormData, amount: e.target.value })}
                className="col-span-3"
                placeholder="ex: 1000 €"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plannedStartDate" className="text-right">
                Date de début prévue
              </Label>
              <Input
                id="plannedStartDate"
                type="date"
                value={taskFormData.plannedStartDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, plannedStartDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plannedEndDate" className="text-right">
                Date de fin prévue
              </Label>
              <Input
                id="plannedEndDate"
                type="date"
                value={taskFormData.plannedEndDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, plannedEndDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actualStartDate" className="text-right">
                Date de début réelle
              </Label>
              <Input
                id="actualStartDate"
                type="date"
                value={taskFormData.actualStartDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, actualStartDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="actualEndDate" className="text-right">
                Date de fin réelle
              </Label>
              <Input
                id="actualEndDate"
                type="date"
                value={taskFormData.actualEndDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, actualEndDate: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">
                Progression ({taskFormData.progress}%)
              </Label>
              <div className="col-span-3">
                <Progress value={taskFormData.progress} className="h-2" />
                <Input
                  id="progress"
                  type="range"
                  min="0"
                  max="100"
                  value={taskFormData.progress}
                  onChange={(e) => handleTaskProgressChange(parseInt(e.target.value))}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Statut
              </Label>
              <Select
                value={taskFormData.status}
                onValueChange={(value) => setTaskFormData({ ...taskFormData, status: value as 'pending' | 'in_progress' | 'completed' | 'delayed' })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="delayed">Retardé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progressStatus" className="text-right">
                État d'avancement
              </Label>
              <div className="col-span-3 flex items-center">
                <Badge className={getProgressStatusColor(taskFormData.progressStatus)}>
                  {taskFormData.progressStatus === 'on_schedule' && 'Dans les délais'}
                  {taskFormData.progressStatus === 'ahead' && 'En avance'}
                  {taskFormData.progressStatus === 'behind' && 'En retard'}
                  {taskFormData.progressStatus === 'at_risk' && 'À risque'}
                </Badge>
                <span className="ml-2 text-sm text-gray-500">(Calculé automatiquement)</span>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="remarks" className="text-right">
                Remarques
              </Label>
              <Textarea
                id="remarks"
                value={taskFormData.remarks}
                onChange={(e) => setTaskFormData({ ...taskFormData, remarks: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Financier
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isReceived"
                    checked={taskFormData.isReceived}
                    onCheckedChange={(checked) =>
                      setTaskFormData({ ...taskFormData, isReceived: checked as boolean })
                    }
                  />
                  <Label htmlFor="isReceived">Reçu</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPaid"
                    checked={taskFormData.isPaid}
                    onCheckedChange={(checked) =>
                      setTaskFormData({ ...taskFormData, isPaid: checked as boolean })
                    }
                  />
                  <Label htmlFor="isPaid">Payé</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleTaskSubmit}>{editingTask ? 'Mettre à jour' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Templates</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos modèles de projets</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTemplateId ? 'Modifier le template' : 'Créer un nouveau template'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Catégories</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addCategory}>
                      <Plus className="mr-1 h-4 w-4" /> Ajouter une catégorie
                    </Button>
                  </div>

                  {formData.categories.map((category, categoryIndex) => (
                    <Card key={categoryIndex} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="space-y-1">
                              <Label htmlFor={`category-${categoryIndex}-name`}>Nom de la catégorie *</Label>
                              <Input
                                id={`category-${categoryIndex}-name`}
                                value={category.name}
                                onChange={(e) => updateCategory(categoryIndex, 'name', e.target.value)}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label htmlFor={`category-${categoryIndex}-startDate`}>Date de début</Label>
                                <Input
                                  id={`category-${categoryIndex}-startDate`}
                                  type="date"
                                  value={category.startDate}
                                  onChange={(e) => updateCategory(categoryIndex, 'startDate', e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor={`category-${categoryIndex}-endDate`}>Date de fin</Label>
                                <Input
                                  id={`category-${categoryIndex}-endDate`}
                                  type="date"
                                  value={category.endDate}
                                  onChange={(e) => updateCategory(categoryIndex, 'endDate', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCategory(categoryIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Équipes</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addTeam(categoryIndex)}
                            >
                              <Plus className="mr-1 h-4 w-4" /> Ajouter une équipe
                            </Button>
                          </div>

                          {category.teams.map((team, teamIndex) => (
                            <Card key={teamIndex} className="overflow-hidden">
                              <CardHeader className="bg-gray-50 p-3">
                                <div className="flex items-center justify-between">
                                  <div className="grid grid-cols-2 gap-4 w-full">
                                    <div className="space-y-1">
                                      <Label htmlFor={`team-${categoryIndex}-${teamIndex}-name`}>Nom de l'équipe *</Label>
                                      <Input
                                        id={`team-${categoryIndex}-${teamIndex}-name`}
                                        value={team.name}
                                        onChange={(e) => updateTeam(categoryIndex, teamIndex, 'name', e.target.value)}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label htmlFor={`team-${categoryIndex}-${teamIndex}-specialty`}>Spécialité *</Label>
                                      <Input
                                        id={`team-${categoryIndex}-${teamIndex}-specialty`}
                                        value={team.specialty}
                                        onChange={(e) => updateTeam(categoryIndex, teamIndex, 'specialty', e.target.value)}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeTeam(categoryIndex, teamIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h5 className="font-medium">Tâches</h5>
                                    <div className="flex space-x-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openTaskDialog(categoryIndex, teamIndex)}
                                      >
                                        <Plus className="mr-1 h-4 w-4" /> Ajouter une tâche
                                      </Button>
                                    </div>
                                  </div>

                                  {team.tasks.length > 0 ? (
                                    <div className="space-y-2">
                                      {team.tasks.map((task, taskIndex) => (
                                        <div
                                          key={taskIndex}
                                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                                        >
                                          <div className="flex-1">
                                            <div className="font-medium">{task.name || 'Sans nom'}</div>
                                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                                              <span>{task.duration || 'Durée non spécifiée'}</span>
                                              <span>•</span>
                                              <span>{task.amount || 'Montant non spécifié'}</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-1">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => openTaskDialog(categoryIndex, teamIndex, taskIndex)}
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => removeTask(categoryIndex, teamIndex, taskIndex)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center p-4 text-gray-500">
                                      Aucune tâche ajoutée
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                    resetForm();
                    setEditingTemplateId(null);
                    setIsCreateDialogOpen(false);
                  }}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingTemplateId ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and filter section */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => viewTemplate(template)}>
                      <Eye className="mr-1 h-4 w-4" /> Voir
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => duplicateTemplate(template)}>
                      <Copy className="mr-1 h-4 w-4" /> Dupliquer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(template)}>
                      <Edit className="mr-1 h-4 w-4" /> Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteTemplateWithConfirmation(template)}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="font-medium flex items-center">
                      <FileText className="mr-2 h-4 w-4" /> Description
                    </h3>
                    <p className="text-gray-600 mt-1">{template.description}</p>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center">
                      <ClipboardList className="mr-2 h-4 w-4" /> Détails
                    </h3>
                    <div className="text-gray-600 mt-1 space-y-1">
                      <p>{template.categories.length} catégories</p>
                      <p>{getTotalTeams(template)} équipes</p>
                      <p>{getTotalTasks(template)} tâches</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium flex items-center">
                      <Calendar className="mr-2 h-4 w-4" /> Créé le
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Date inconnue'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 bg-gray-50 rounded-lg">
            <div className="flex justify-center">
              <ClipboardList className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun template trouvé</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? 'Aucun template ne correspond à votre recherche.' : 'Commencez par créer un nouveau template.'}
            </p>
          </div>
        )}
      </div>

      {/* Template viewing dialog */}
      {viewingTemplate && (
        <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{viewingTemplate.name}</span>
                <Button variant="outline" size="sm" onClick={() => setViewingTemplate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-gray-600 mt-1">{viewingTemplate.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Catégories</h3>
                {viewingTemplate.categories.map((category, i) => (
                  <Card key={i}>
                    <CardHeader className="bg-gray-50 py-3">
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {category.teams.map((team, j) => (
                          <div key={j} className="border rounded-md p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Users className="h-4 w-4" />
                              <h4 className="font-medium">{team.name} - {team.specialty}</h4>
                            </div>
                            <div className="space-y-2 mt-2">
                              <h5 className="text-sm font-medium text-gray-500">Tâches:</h5>
                              {team.tasks && team.tasks.length > 0 ? (
                                <div className="space-y-2">
                                  {team.tasks.map((task, k) => (
                                    <div key={k} className="bg-gray-50 p-3 rounded-md">
                                      <div className="font-medium">{task.name}</div>
                                      {task.description && (
                                        <div className="text-sm text-gray-600 mt-1">{task.description}</div>
                                      )}
                                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-500">
                                        {task.duration && (
                                          <div className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" /> Durée: {task.duration}
                                          </div>
                                        )}
                                        {task.amount && (
                                          <div className="flex items-center">
                                            <DollarSign className="h-3 w-3 mr-1" /> Montant: {task.amount}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">Aucune tâche</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      </div>
    );
}