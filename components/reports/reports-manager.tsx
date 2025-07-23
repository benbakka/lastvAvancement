'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export function ReportsManager() {
  const { 
    selectedProject, 
    projects,
    tasks, 
    teams, 
    villas,
    getVillasByProject 
  } = useStore();
  
  const [reportType, setReportType] = useState('overview');
  const [timeRange, setTimeRange] = useState('month');

  const projectVillas = selectedProject ? getVillasByProject(selectedProject.id) : [];
  
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  
  const totalAmount = tasks.reduce((sum, task) => sum + (task.amount || 0), 0);
  const paidAmount = tasks.filter(t => t.isPaid).reduce((sum, task) => sum + (task.amount || 0), 0);
  const receivedTasks = tasks.filter(t => t.isReceived).length;
  
  const activeTeams = teams.filter(t => t.activeTasks > 0).length;
  const avgPerformance = teams.reduce((sum, team) => sum + team.performance, 0) / teams.length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'delayed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const exportReport = () => {
    // Mock export functionality
    console.log('Exporting report...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Analyses</h1>
          <p className="text-gray-600 mt-1">Suivez les performances de vos projets</p>
        </div>
        
        <div className="flex space-x-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Vue d'ensemble</SelectItem>
              <SelectItem value="financial">Rapport financier</SelectItem>
              <SelectItem value="teams">Performance équipes</SelectItem>
              <SelectItem value="progress">Avancement projet</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">7 jours</SelectItem>
              <SelectItem value="month">30 jours</SelectItem>
              <SelectItem value="quarter">3 mois</SelectItem>
              <SelectItem value="year">1 an</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportReport} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      {!selectedProject && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sélectionnez un projet</h3>
            <p className="text-gray-600 text-center">
              Choisissez un projet dans la barre de navigation pour voir ses rapports.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedProject && (
        <>
          {/* Overview Report */}
          {reportType === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Villas</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projectVillas.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {projectVillas.filter(v => v.status === 'completed').length} terminées
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tâches</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalTasks}</div>
                    <p className="text-xs text-muted-foreground">
                      {completedTasks} terminées ({Math.round((completedTasks / totalTasks) * 100)}%)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Équipes actives</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeTeams}</div>
                    <p className="text-xs text-muted-foreground">
                      Performance moyenne: {Math.round(avgPerformance)}%
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avancement</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedProject.progress}%</div>
                    <p className="text-xs text-muted-foreground">
                      {delayedTasks > 0 ? `${delayedTasks} en retard` : 'Dans les temps'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress by Villa */}
              <Card>
                <CardHeader>
                  <CardTitle>Avancement par villa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectVillas.map((villa) => (
                      <div key={`villa-report-${villa.id}`} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{villa.name}</span>
                            <Badge variant="outline" className={getStatusColor(villa.status)}>
                              {villa.status === 'completed' ? 'Terminée' :
                               villa.status === 'in_progress' ? 'En cours' :
                               villa.status === 'delayed' ? 'En retard' : 'Non démarrée'}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{villa.progress}%</span>
                        </div>
                        <Progress value={villa.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Task Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des tâches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-700">{completedTasks}</div>
                      <div className="text-sm text-green-600">Terminées</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-700">{inProgressTasks}</div>
                      <div className="text-sm text-blue-600">En cours</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-red-700">{delayedTasks}</div>
                      <div className="text-sm text-red-600">En retard</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-700">{totalTasks - completedTasks - inProgressTasks - delayedTasks}</div>
                      <div className="text-sm text-yellow-600">En attente</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financial Report */}
          {reportType === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Montant total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalAmount.toLocaleString()} DH</div>
                    <p className="text-xs text-muted-foreground">
                      Toutes tâches confondues
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Montant payé</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{paidAmount.toLocaleString()} DH</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((paidAmount / totalAmount) * 100)}% du total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Montant dû</CardTitle>
                    <Clock className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{(totalAmount - paidAmount).toLocaleString()} DH</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(((totalAmount - paidAmount) / totalAmount) * 100)}% du total
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Statut des paiements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progression des paiements</span>
                        <span>{Math.round((paidAmount / totalAmount) * 100)}%</span>
                      </div>
                      <Progress value={(paidAmount / totalAmount) * 100} className="h-3" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div>
                        <h4 className="font-medium mb-2">Tâches réceptionnées</h4>
                        <div className="text-2xl font-bold text-blue-600">{receivedTasks}</div>
                        <div className="text-sm text-gray-600">sur {completedTasks} terminées</div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Tâches non réceptionnées</h4>
                        <div className="text-2xl font-bold text-orange-600">{completedTasks - receivedTasks}</div>
                        <div className="text-sm text-gray-600">en attente de réception</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Teams Performance Report */}
          {reportType === 'teams' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <Card key={`team-report-${team.id}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-gray-600">{team.specialty}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Performance</span>
                            <span>{team.performance}%</span>
                          </div>
                          <Progress value={team.performance} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{team.membersCount}</div>
                            <div className="text-xs text-gray-600">Membres</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600">{team.activeTasks}</div>
                            <div className="text-xs text-gray-600">Tâches actives</div>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Dernière activité: {team.lastActivity.toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Progress Report */}
          {reportType === 'progress' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avancement global du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-lg mb-4">
                        <span>Progression générale</span>
                        <span className="font-bold">{selectedProject.progress}%</span>
                      </div>
                      <Progress value={selectedProject.progress} className="h-4" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">{projectVillas.length}</div>
                        <div className="text-sm text-blue-600">Villas totales</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {projectVillas.filter(v => v.status === 'completed').length}
                        </div>
                        <div className="text-sm text-green-600">Villas terminées</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-3xl font-bold text-orange-600">
                          {projectVillas.filter(v => v.status === 'in_progress').length}
                        </div>
                        <div className="text-sm text-orange-600">Villas en cours</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Timeline du projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Début du projet</div>
                        <div className="text-sm text-gray-600">{selectedProject.startDate.toLocaleDateString()}</div>
                      </div>
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <div className="font-medium">Aujourd'hui</div>
                        <div className="text-sm text-blue-600">{selectedProject.progress}% complété</div>
                      </div>
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">Fin prévue</div>
                        <div className="text-sm text-green-600">{selectedProject.endDate.toLocaleDateString()}</div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}