'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp,
  UserCog,
  Menu,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { canAccessFinance, canAccessUsers, canAccessReports } = usePermissions();
  const [isFinanceOpen, setIsFinanceOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch - só renderiza permissões após montar no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Membros',
      href: '/members',
      icon: Users,
      show: true,
    },
    {
      name: 'Departamentos',
      href: '/departments',
      icon: Building2,
      show: true,
    },
    {
      name: 'Financeiro',
      icon: DollarSign,
      show: isMounted ? canAccessFinance() : false,
      submenu: [
        { name: 'Caixa', href: '/finances/cash-flows' },
        { name: 'Contas a Pagar', href: '/finances/accounts-payable' },
        { name: 'Contas a Receber', href: '/finances/accounts-receivable' },
      ],
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: TrendingUp,
      show: isMounted ? canAccessReports() : false,
    },
    {
      name: 'Usuários',
      href: '/users',
      icon: UserCog,
      show: isMounted ? canAccessUsers() : false,
    },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Logo/Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold">AD Sede Uruaçu</h1>
        <p className="text-xs text-sidebar-foreground/70 mt-1">Gerência Church</p>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          if (!item.show) return null;

          if (item.submenu) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors',
                    'hover:bg-sidebar-accent',
                    'text-sidebar-foreground'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isFinanceOpen && 'transform rotate-180'
                    )}
                  />
                </button>
                {isFinanceOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'block px-4 py-2 rounded-lg transition-colors text-sm',
                          pathname === subItem.href
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground/80'
                        )}
                      >
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
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                pathname === item.href
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                  : 'hover:bg-sidebar-accent text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
