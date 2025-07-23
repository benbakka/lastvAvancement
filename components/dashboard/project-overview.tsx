'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Calendar, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export function ProjectOverview() {
  const { selectedProject, getVillasByProject } = useStore();
  
  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">Sélectionnez un projet pour voir les détails</p>
        </CardContent>
      </Card>
    );
  }

  const projectVillas = getVillasByProject(selectedProject.id);
  const completedVillas = projectVillas.filter(v => v.status === 'completed').length;
  const delayedVillas = projectVillas.filter(v => v.status === 'delayed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedProject.name}</CardTitle>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {selectedProject.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {selectedProject.startDate.toLocaleDateString()} - {selectedProject.endDate.toLocaleDateString()}
                </div>
                <Badge variant={selectedProject.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {selectedProject.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Détails
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Avancement global</span>
                <span>{selectedProject.progress}%</span>
              </div>
              <Progress value={selectedProject.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{projectVillas.length}</div>
                <div className="text-sm text-gray-600">Villas total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedVillas}</div>
                <div className="text-sm text-gray-600">Terminées</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{delayedVillas}</div>
                <div className="text-sm text-gray-600">En retard</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Villas List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Villas du projet
            </CardTitle>
            <Button size="sm">
              Ajouter une villa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projectVillas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune villa dans ce projet
            </div>
          ) : (
            <div className="space-y-4">
              {projectVillas.map((villa) => (
                <div key={`overview-villa-${villa.id}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold">{villa.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(villa.status)} text-white`}
                        >
                          {getStatusText(villa.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {villa.type} • {villa.surface}m² • {villa.tasksCount} tâches
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avancement</span>
                          <span>{villa.progress}%</span>
                        </div>
                        <Progress value={villa.progress} className="h-1" />
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}