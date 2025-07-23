'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Bot, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building2
} from 'lucide-react';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock AI recommendations - will be replaced with real API data
  const recommendations = [
    {
      id: '1',
      type: 'delay',
      priority: 'high',
      title: 'Retard détecté - Plomberie Villa A1',
      description: 'La catégorie Plomberie accuse un retard de 3 jours. Recommandation: Ajouter une équipe supplémentaire.',
      action: 'Assigner équipe',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      id: '2',
      type: 'optimization',
      priority: 'medium',
      title: 'Optimisation des ressources',
      description: 'L\'équipe Électricité sera libre dans 2 jours. Planifier le démarrage de Villa B2.',
      action: 'Planifier',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      id: '3',
      type: 'financial',
      priority: 'medium',
      title: 'Réceptions en attente',
      description: '5 tâches terminées en attente de réception depuis plus de 5 jours.',
      action: 'Programmer réception',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      id: '4',
      type: 'team',
      priority: 'low',
      title: 'Performance équipe',
      description: 'L\'équipe Maçonnerie maintient une performance de 95% ce mois.',
      action: 'Voir détails',
      icon: Users,
      color: 'text-green-600'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={cn(
          "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
          "shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200",
          "hover:scale-105"
        )}>
          <Bot className="h-4 w-4 mr-2" />
          Assistant IA
          <Badge variant="secondary" className="ml-2 animate-pulse-soft">
            {recommendations.filter(r => r.priority === 'high').length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-gradient">Assistant Chantier IA</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* AI Status */}
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50 card-enhanced">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">Analyse en cours</h3>
                  <p className="text-blue-700 mt-1">
                    Surveillance continue de {recommendations.length} points d'attention
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse-soft"></div>
                  <span className="text-green-700 font-semibold">Actif</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              Recommandations intelligentes
            </h3>
            
            {recommendations.map((rec) => (
              <Card key={`recommendation-${rec.id}`} className="card-enhanced">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-5">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50">
                      <rec.icon className={`h-5 w-5 ${rec.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">{rec.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{rec.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                          {rec.action}
                        </Button>
                        <Button size="sm" variant="outline" className="hover:bg-gray-50">
                          Plus tard
                        </Button>
                        <Button size="sm" variant="ghost" className="hover:bg-gray-50">
                          Ignorer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Insights */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Insights du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:shadow-lg transition-all duration-200">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">85%</div>
                  <div className="text-green-600 font-medium">Efficacité globale</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 hover:shadow-lg transition-all duration-200">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">12</div>
                  <div className="text-blue-600 font-medium">Villas en cours</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200/50 hover:shadow-lg transition-all duration-200">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-700 mb-1">3</div>
                  <div className="text-orange-600 font-medium">Jours d'avance</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}