'use client';

import { UserRole } from '@/types/api';

export function usePermissions() {
  const getUserRole = (): UserRole | null => {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      // Decode JWT to get role
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role as UserRole;
    } catch {
      return null;
    }
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    const role = getUserRole();
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const canAccessFinance = (): boolean => {
    return hasRole([UserRole.admin, UserRole.finance]);
  };

  const canAccessUsers = (): boolean => {
    return hasRole([UserRole.admin]);
  };

  const canAccessReports = (): boolean => {
    return hasRole([UserRole.admin, UserRole.finance]);
  };

  return {
    getUserRole,
    hasRole,
    canAccessFinance,
    canAccessUsers,
    canAccessReports,
  };
}
