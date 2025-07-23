'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { 
  Building2, 
  Home, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Wrench,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: Home, badge: null },
  { name: 'Projets', href: '/projects', icon: FolderOpen, badge: null },
  { name: 'Villas', href: '/villas', icon: Building2, badge: null },
  { name: 'Équipes', href: '/teams', icon: Users, badge: null },
  { name: 'Utilisateurs', href: '/users', icon: Users, badge: 'new' },
  { name: 'Rapports', href: '/reports', icon: BarChart3, badge: null },
  { name: 'Templates', href: '/templates', icon: Wrench, badge: null },
  { name: 'Paramètres', href: '/settings', icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, getUnreadNotifications } = useStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const unreadCount = getUnreadNotifications().length;

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-xl transition-all duration-300 ease-in-out',
          'lg:translate-x-0',
          sidebarOpen ? 'w-72 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600">
          {sidebarOpen && (
            <div className="flex items-center space-x-2 animate-slide-in-right">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">ChantierPro</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-8 w-8 p-0 text-white hover:bg-white/20 transition-colors duration-200"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredItem === item.name;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  // Close sidebar on mobile when clicking a navigation item
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  'group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden',
                  'hover:shadow-lg hover:shadow-blue-500/10',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                  !sidebarOpen && 'justify-center'
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Background Animation */}
                <div className={cn(
                  'absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform scale-x-0 transition-transform duration-300 origin-left',
                  isHovered && !isActive && 'scale-x-100'
                )} />
                
                {/* Icon */}
                <div className={cn(
                  'relative flex items-center justify-center w-6 h-6 transition-transform duration-200',
                  isHovered && 'scale-110'
                )}>
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                </div>
                
                {/* Text and Badge */}
                {sidebarOpen && (
                  <div className="flex items-center justify-between flex-1 ml-3 relative">
                    <span className="truncate">{item.name}</span>
                    {item.badge === 'new' && (
                      <Badge className="ml-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs animate-pulse-soft">
                        Nouveau
                      </Badge>
                    )}
                    {item.name === 'Tableau de bord' && unreadCount > 0 && (
                      <Badge className="ml-2 bg-red-500 text-white text-xs animate-bounce-soft">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                )}
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center space-x-3 animate-slide-in-up">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">AB</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Ahmed Benali</p>
                <p className="text-xs text-gray-500 truncate">Administrateur</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}