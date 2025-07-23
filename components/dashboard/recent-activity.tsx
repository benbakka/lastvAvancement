'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Eye
} from 'lucide-react';

export function RecentActivity() {
  const { tasks, notifications, getUnreadNotifications } = useStore();
  
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
    
  const unreadNotifications = getUnreadNotifications().slice(0, 3);

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delayed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'delay': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'unpaid': return <DollarSign className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Aucune activité récente
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={`recent-task-${task.id}`} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  {getTaskStatusIcon(task.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.name}</p>
                    <p className="text-xs text-gray-500">
                      Mis à jour {new Date(task.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.progress}%
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes
            </CardTitle>
            <Badge variant="destructive">
              {unreadNotifications.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {unreadNotifications.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Aucune alerte
            </div>
          ) : (
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <div key={`recent-notification-${notification.id}`} className="p-3 border rounded-lg">
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Voir toutes les alertes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}