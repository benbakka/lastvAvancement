'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  ClipboardList, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react';

export function StatsCards() {
  const { selectedProject, getVillasByProject, categories, tasks, teams } = useStore();
  
  if (!selectedProject) return null;

  const projectVillas = getVillasByProject(selectedProject.id);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const delayedTasks = tasks.filter(t => t.status === 'delayed').length;
  const totalAmount = tasks.reduce((sum, task) => sum + (task.amount || 0), 0);
  const paidAmount = tasks.filter(t => t.isPaid).reduce((sum, task) => sum + (task.amount || 0), 0);

  const stats = [
    {
      title: 'Villas',
      value: projectVillas.length,
      subtitle: `${projectVillas.filter(v => v.status === 'completed').length} terminées`,
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Équipes actives',
      value: teams.filter(t => t.activeTasks > 0).length,
      subtitle: `${teams.length} équipes total`,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Tâches',
      value: tasks.length,
      subtitle: `${completedTasks} terminées`,
      icon: ClipboardList,
      color: 'purple'
    },
    {
      title: 'Avancement',
      value: `${selectedProject.progress}%`,
      subtitle: delayedTasks > 0 ? `${delayedTasks} en retard` : 'Dans les temps',
      icon: TrendingUp,
      color: selectedProject.progress > 75 ? 'green' : selectedProject.progress > 50 ? 'orange' : 'red'
    },
    {
      title: 'Alertes',
      value: selectedProject.alertsCount,
      subtitle: 'Nécessitent attention',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Paiements',
      value: `${Math.round((paidAmount / totalAmount) * 100)}%`,
      subtitle: `${paidAmount.toLocaleString()} / ${totalAmount.toLocaleString()} DH`,
      icon: DollarSign,
      color: 'green'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}