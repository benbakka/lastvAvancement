'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Save
} from 'lucide-react';

export function SettingsManager() {
  const { users } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileSettings, setProfileSettings] = useState({
    name: 'Ahmed Benali',
    email: 'ahmed.benali@example.com',
    phone: '+212 6 12 34 56 78',
    company: 'ChantierPro SARL',
    language: 'fr',
    timezone: 'Africa/Casablanca'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskDeadlines: true,
    teamUpdates: true,
    projectAlerts: true,
    weeklyReports: false,
    monthlyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '365',
    maintenanceMode: false
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: 'blue',
    compactMode: false,
    showAnimations: true
  });

  const handleSaveProfile = () => {
    console.log('Saving profile settings:', profileSettings);
    // Here you would typically call an API to save the settings
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', notificationSettings);
  };

  const handleSaveSecurity = () => {
    console.log('Saving security settings:', securitySettings);
  };

  const handleSaveSystem = () => {
    console.log('Saving system settings:', systemSettings);
  };

  const handleSaveAppearance = () => {
    console.log('Saving appearance settings:', appearanceSettings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configurez votre application selon vos préférences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Système
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations du profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={profileSettings.name}
                    onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="company">Entreprise</Label>
                  <Input
                    id="company"
                    value={profileSettings.company}
                    onChange={(e) => setProfileSettings({ ...profileSettings, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Langue</Label>
                  <Select value={profileSettings.language} onValueChange={(value) => setProfileSettings({ ...profileSettings, language: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select value={profileSettings.timezone} onValueChange={(value) => setProfileSettings({ ...profileSettings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Casablanca">Casablanca (GMT+1)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-gray-600">Recevoir les notifications importantes par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-600">Notifications en temps réel dans l'application</p>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Échéances des tâches</Label>
                    <p className="text-sm text-gray-600">Alertes pour les deadlines approchantes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.taskDeadlines}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, taskDeadlines: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mises à jour des équipes</Label>
                    <p className="text-sm text-gray-600">Notifications des activités des équipes</p>
                  </div>
                  <Switch
                    checked={notificationSettings.teamUpdates}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, teamUpdates: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertes de projet</Label>
                    <p className="text-sm text-gray-600">Notifications pour les problèmes critiques</p>
                  </div>
                  <Switch
                    checked={notificationSettings.projectAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, projectAlerts: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rapports hebdomadaires</Label>
                    <p className="text-sm text-gray-600">Résumé hebdomadaire par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rapports mensuels</Label>
                    <p className="text-sm text-gray-600">Rapport détaillé mensuel</p>
                  </div>
                  <Switch
                    checked={notificationSettings.monthlyReports}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, monthlyReports: checked })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres de sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Authentification à deux facteurs</Label>
                    <p className="text-sm text-gray-600">Sécurité renforcée avec 2FA</p>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorAuth: checked })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Timeout de session (minutes)</Label>
                    <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 heure</SelectItem>
                        <SelectItem value="120">2 heures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="passwordExpiry">Expiration mot de passe (jours)</Label>
                    <Select value={securitySettings.passwordExpiry} onValueChange={(value) => setSecuritySettings({ ...securitySettings, passwordExpiry: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 jours</SelectItem>
                        <SelectItem value="60">60 jours</SelectItem>
                        <SelectItem value="90">90 jours</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertes de connexion</Label>
                    <p className="text-sm text-gray-600">Notification lors de nouvelles connexions</p>
                  </div>
                  <Switch
                    checked={securitySettings.loginAlerts}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, loginAlerts: checked })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Paramètres système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sauvegarde automatique</Label>
                    <p className="text-sm text-gray-600">Sauvegarde automatique des données</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Toutes les heures</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="dataRetention">Rétention des données (jours)</Label>
                    <Select value={systemSettings.dataRetention} onValueChange={(value) => setSystemSettings({ ...systemSettings, dataRetention: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="90">90 jours</SelectItem>
                        <SelectItem value="180">180 jours</SelectItem>
                        <SelectItem value="365">1 an</SelectItem>
                        <SelectItem value="unlimited">Illimitée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode maintenance</Label>
                    <p className="text-sm text-gray-600">Activer le mode maintenance</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSystem} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Thème</Label>
                    <Select value={appearanceSettings.theme} onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="auto">Automatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <Select value={appearanceSettings.primaryColor} onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, primaryColor: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Bleu</SelectItem>
                        <SelectItem value="green">Vert</SelectItem>
                        <SelectItem value="purple">Violet</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mode compact</Label>
                    <p className="text-sm text-gray-600">Interface plus dense</p>
                  </div>
                  <Switch
                    checked={appearanceSettings.compactMode}
                    onCheckedChange={(checked) => setAppearanceSettings({ ...appearanceSettings, compactMode: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-gray-600">Activer les animations de l'interface</p>
                  </div>
                  <Switch
                    checked={appearanceSettings.showAnimations}
                    onCheckedChange={(checked) => setAppearanceSettings({ ...appearanceSettings, showAnimations: checked })}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveAppearance} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}