'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { 
  Bell,
  User,
  ChevronDown,
  Search,
  Plus,
  Menu,
  Sparkles,
  Settings,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { 
    selectedProject, 
    projects, 
    setSelectedProject, 
    getUnreadNotifications,
    sidebarOpen,
    setSidebarOpen
  } = useStore();
  
  const [searchFocused, setSearchFocused] = useState(false);
  const unreadCount = getUnreadNotifications().length;

  return (
    <div 
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 z-30 flex items-center justify-between px-4 lg:px-6 transition-all duration-300 shadow-sm',
        sidebarOpen ? 'left-0 lg:left-72' : 'left-0 lg:left-20'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Project Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">Projet:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "min-w-[200px] justify-between bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80 transition-all duration-200",
                  "hover:shadow-md hover:shadow-blue-500/10"
                )}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft" />
                  <span className="truncate">
                    {selectedProject ? selectedProject.name : 'Sélectionner un projet'}
                  </span>
                </div>
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-white/95 backdrop-blur-xl border-gray-200/50">
              {projects.map((project) => (
                <DropdownMenuItem
                  key={`project-nav-${project.id}`}
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50/80 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      project.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  {project.alertsCount > 0 && (
                    <Badge variant="destructive" className="ml-2 animate-pulse-soft">
                      {project.alertsCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative hidden md:block">
          <div className={cn(
            "relative transition-all duration-300",
            searchFocused ? "scale-105" : "scale-100"
          )}>
            <Search className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200",
              searchFocused ? "text-blue-500" : "text-gray-400"
            )} />
            <Input
              placeholder="Rechercher..."
              className={cn(
                "pl-10 w-64 bg-white/80 backdrop-blur-sm border-gray-200/50 transition-all duration-200",
                "focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "relative bg-white/80 backdrop-blur-sm border-gray-200/50 hover:bg-gray-50/80",
                "hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200"
              )}
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs animate-bounce-soft"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 bg-white/95 backdrop-blur-xl border-gray-200/50">
            <div className="p-3 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <p className="text-sm text-gray-500">{unreadCount} nouvelles notifications</p>
            </div>
            {getUnreadNotifications().slice(0, 3).map((notification) => (
              <DropdownMenuItem key={`notification-${notification.id}`} className="p-3 hover:bg-gray-50/80">
                <div className="flex items-start space-x-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2",
                    notification.priority === 'high' ? 'bg-red-500' : 
                    notification.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 text-center text-blue-600 hover:bg-blue-50/80">
              Voir toutes les notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "gap-2 hover:bg-gray-50/80 transition-all duration-200",
                "hover:shadow-md hover:shadow-blue-500/10"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/ahmed.jpg" />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                  AB
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium">Ahmed B.</p>
                <p className="text-xs text-gray-500">Administrateur</p>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-gray-200/50">
            <div className="p-3 border-b border-gray-200/50">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/avatars/ahmed.jpg" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    AB
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900">Ahmed Benali</p>
                  <p className="text-sm text-gray-500">ahmed@chantierpro.ma</p>
                </div>
              </div>
            </div>
            <DropdownMenuItem className="p-3 hover:bg-gray-50/80">
              <User className="mr-3 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 hover:bg-gray-50/80">
              <Settings className="mr-3 h-4 w-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 hover:bg-gray-50/80">
              <Sparkles className="mr-3 h-4 w-4" />
              Aide & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="p-3 text-red-600 hover:bg-red-50/80">
              <LogOut className="mr-3 h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}