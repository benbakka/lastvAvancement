'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  User, 
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Settings,
  Crown,
  Users as UsersIcon,
  Briefcase
} from 'lucide-react';
import { User as UserType } from '@/lib/types';

export function UsersManager() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState('users');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'worker' as 'admin' | 'team_leader' | 'worker',
    isActive: true,
    avatar: ''
  });

  // Extend user type with additional fields for better management
  const extendedUsers = users.map(user => ({
    ...user,
    isActive: true, // Default to active, would come from backend
    lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random last login
    phone: '+212 6 12 34 56 78' // Default phone, would come from backend
  }));

  const filteredUsers = extendedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = () => {
    const newUser: UserType = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      createdAt: new Date(),
      isActive: true,
      phone: formData.phone,
      lastLogin: new Date()
    };

    addUser(newUser);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role
    });

    setEditingUser(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'worker',
      isActive: true,
      avatar: ''
    });
  };

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: '+212 6 12 34 56 78', // Would come from user data
      role: user.role,
      isActive: true, // Would come from user data
      avatar: user.avatar || ''
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'team_leader': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'worker': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'team_leader': return 'Chef d\'équipe';
      case 'worker': return 'Ouvrier';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'team_leader': return <Shield className="h-4 w-4" />;
      case 'worker': return <Briefcase className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const rolePermissions = {
    admin: [
      'Gestion complète des projets',
      'Gestion des utilisateurs et rôles',
      'Accès aux rapports financiers',
      'Configuration système',
      'Gestion des templates',
      'Supervision globale'
    ],
    team_leader: [
      'Gestion de son équipe',
      'Création et modification des tâches',
      'Validation des réceptions',
      'Rapports d\'équipe',
      'Planification des travaux'
    ],
    worker: [
      'Consultation des tâches assignées',
      'Mise à jour du statut des tâches',
      'Ajout de photos et remarques',
      'Consultation du planning'
    ]
  };

  const statsData = {
    totalUsers: extendedUsers.length,
    activeUsers: extendedUsers.filter(u => u.isActive).length,
    admins: extendedUsers.filter(u => u.role === 'admin').length,
    teamLeaders: extendedUsers.filter(u => u.role === 'team_leader').length,
    workers: extendedUsers.filter(u => u.role === 'worker').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Comptes et Rôles</h1>
          <p className="text-gray-600 mt-1">Gérez les utilisateurs et leurs permissions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ahmed Benali"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: ahmed@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ex: +212 6 12 34 56 78"
                />
              </div>
              <div>
                <Label htmlFor="role">Rôle</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="team_leader">Chef d'équipe</SelectItem>
                    <SelectItem value="worker">Ouvrier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label>Compte actif</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateUser}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rôles et Permissions
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="team_leader">Chef d'équipe</SelectItem>
                <SelectItem value="worker">Ouvrier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="inactive">Inactifs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statsData.totalUsers}</div>
                  <div className="text-sm text-gray-600">Total utilisateurs</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statsData.activeUsers}</div>
                  <div className="text-sm text-gray-600">Actifs</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{statsData.admins}</div>
                  <div className="text-sm text-gray-600">Administrateurs</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{statsData.teamLeaders}</div>
                  <div className="text-sm text-gray-600">Chefs d'équipe</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{statsData.workers}</div>
                  <div className="text-sm text-gray-600">Ouvriers</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Card key={`user-${user.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <UserCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <UserX className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rôle:</span>
                      <Badge className={`${getRoleColor(user.role)} flex items-center gap-1`}>
                        {getRoleIcon(user.role)}
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Statut:</span>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {user.phone}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Créé le {user.createdAt.toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Dernière connexion: {user.lastLogin.toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setViewingUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l'utilisateur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer {user.name} ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteUser(user.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                <p className="text-gray-600 text-center mb-4">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Aucun utilisateur ne correspond à vos critères de recherche.' 
                    : 'Commencez par créer votre premier utilisateur.'}
                </p>
                {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un utilisateur
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <Card key={`role-${role}`} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    {getRoleText(role)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {extendedUsers.filter(u => u.role === role).length} utilisateur(s)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Permissions:</h4>
                    <div className="space-y-2">
                      {permissions.map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Role Management Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Gestion des rôles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Les rôles définissent les permissions et l'accès aux fonctionnalités de l'application.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <Crown className="h-4 w-4 mr-2" />
                    Modifier rôle Admin
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Modifier rôle Chef d'équipe
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Modifier rôle Ouvrier
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nom complet</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="team_leader">Chef d'équipe</SelectItem>
                  <SelectItem value="worker">Ouvrier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Compte actif</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateUser}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil utilisateur: {viewingUser?.name}
            </DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={viewingUser.avatar} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {getInitials(viewingUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{viewingUser.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getRoleColor(viewingUser.role)} flex items-center gap-1`}>
                      {getRoleIcon(viewingUser.role)}
                      {getRoleText(viewingUser.role)}
                    </Badge>
                    <Badge variant={viewingUser.isActive ? 'default' : 'secondary'}>
                      {viewingUser.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations de contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{viewingUser.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{viewingUser.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Créé le {viewingUser.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Dernière connexion: {viewingUser.lastLogin ? viewingUser.lastLogin.toLocaleDateString() : 'Jamais'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Permissions du rôle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {rolePermissions[viewingUser.role as keyof typeof rolePermissions].map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{permission}</span>
                      </div>
                    ))}
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