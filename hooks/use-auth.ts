'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { User } from '@/types/api';

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = authService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }
      
      setIsLoading(false);

      if (!authenticated) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/login');
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
  };
}
