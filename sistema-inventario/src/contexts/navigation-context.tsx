'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NavigationLoader } from '@/components/ui/navigation-loader';

interface NavigationContextType {
  isLoading: boolean;
  navigate: (path: string) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Detener loading cuando cambia la ruta
  useEffect(() => {
    if (pendingPath && pathname === pendingPath) {
      setIsLoading(false);
      setPendingPath(null);
    }
  }, [pathname, pendingPath]);

  // Auto-stop loading después de un tiempo máximo
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setPendingPath(null);
      }, 10000); // 10 segundos máximo

      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  const navigate = (path: string) => {
    if (path === pathname) return; // No navegar si ya estamos en la ruta
    
    setIsLoading(true);
    setPendingPath(path);
    router.push(path);
  };

  const startLoading = () => {
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setPendingPath(null);
  };

  const value = {
    isLoading,
    navigate,
    startLoading,
    stopLoading
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
      <NavigationLoader isLoading={isLoading} />
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
