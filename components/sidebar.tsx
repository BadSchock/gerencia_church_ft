'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  DollarSign,
  UserCog,
  ChevronDown,
  ChevronLeft,
  Hotel,
  UserPlus,
  UsersRound,
  FileText,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { canAccessFinance, canAccessUsers } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'Evento': true,
    'Gestão': false,
    'Financeiro': false,
    'Relatórios': false,
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Atualizar CSS variable quando sidebar mudar de estado
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '64px' : '256px'
    );
  }, [isCollapsed]);

  const toggleMenu = (menuName: string) => {
    if (!isCollapsed) {
      setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
    }
  };

  const menuSections = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Evento',
      icon: Calendar,
      show: true,
      submenu: [
        { name: 'Inscrições', href: '/dashboard/event-registrations', icon: UserPlus },
        { name: 'Escolas', href: '/dashboard/schools', icon: Hotel },
        { name: 'Caravanas', href: '/dashboard/caravans', icon: Users },
        { name: 'Alocações', href: '/dashboard/allocations', icon: Building2 },
      ],
    },
    {
      name: 'Gestão',
      icon: UsersRound,
      show: true,
      submenu: [
        { name: 'Equipes', href: '/dashboard/teams', icon: UsersRound },
        { name: 'Membros', href: '/members', icon: Users },
        { name: 'Departamentos', href: '/departments', icon: Building2 },
      ],
    },
    {
      name: 'Financeiro',
      icon: DollarSign,
      show: isMounted ? canAccessFinance() : false,
      submenu: [
        { name: 'Caixa', href: '/finances/cash-flows', icon: DollarSign },
        { name: 'Contas a Pagar', href: '/finances/accounts-payable', icon: FileText },
        { name: 'Contas a Receber', href: '/finances/accounts-receivable', icon: FileText },
      ],
    },
    {
      name: 'Relatórios',
      icon: FileText,
      show: true,
      submenu: [
        { name: 'Hospedagem', href: '/dashboard/reports/accommodation', icon: Hotel },
        { name: 'Inscrições', href: '/dashboard/reports/registrations', icon: UserPlus },
        { name: 'Financeiro', href: '/dashboard/reports/financial', icon: DollarSign },
      ],
    },
    {
      name: 'Usuários',
      href: '/users',
      icon: UserCog,
      show: isMounted ? canAccessUsers() : false,
    },
  ];

  return (
    <aside className={cn(
      "bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 z-50 border-r border-sidebar-border",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo/Header */}
      <div className={cn(
        "border-b border-sidebar-border flex items-center justify-between transition-all",
        isCollapsed ? "p-3" : "p-4"
      )}>
        {!isCollapsed && (
          <div className="flex-1">
            <h1 className="text-lg font-bold">AD Sede Uruaçu</h1>
            <p className="text-[10px] text-sidebar-foreground/70">Gerência Church</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 shrink-0"
        >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      </div>

      {/* Menu */}
      <nav className={cn("space-y-1", isCollapsed ? "p-2" : "p-3")}>
        {menuSections.map((item) => {
          if (!item.show) return null;

          if (item.submenu) {
            const isOpen = openMenus[item.name];

            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    'w-full flex items-center gap-2 rounded-md transition-colors',
                    'hover:bg-sidebar-accent group',
                    isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={cn(isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
                    {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      className={cn(
                        'w-3 h-3 transition-transform',
                        isOpen && 'rotate-180'
                      )}
                    />
                  )}
                </button>
                {isOpen && !isCollapsed && (
                  <div className="mt-0.5 space-y-0.5 ml-2">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-xs',
                          pathname === subItem.href
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground/80'
                        )}
                      >
                        <subItem.icon className="w-3.5 h-3.5" />
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                'flex items-center gap-2 rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                  : 'hover:bg-sidebar-accent text-sidebar-foreground',
                isCollapsed ? 'justify-center p-2' : 'px-3 py-2'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn(isCollapsed ? "w-5 h-5" : "w-4 h-4")} />
              {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
