"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFallbackUserByEmail, type UserData } from '@/lib/users-data';
import { setCurrentUser, clearCurrentUser, api } from '@/lib/api-client';

// Re-exportar UserData como User para compatibilidad
export type User = UserData;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (userId: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  getRoleDisplayName: (role: string) => string;
  getInitials: (name: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para obtener usuario por ID desde la API
async function getUserFromAPI(userId: string): Promise<User | null> {
  try {
    const response = await api.get(`/api/usuarios/${userId}`);

    if (response.ok) {
      const user = await response.json();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo usuario de API:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUserId = localStorage.getItem('currentUserId');
    const authToken = localStorage.getItem('auth-token');

    if (savedUserId && authToken) {
      // Intentar obtener el usuario desde la API
      // Establecer usuario actual para las APIs primero
      setCurrentUser(savedUserId);

      getUserFromAPI(savedUserId).then(savedUser => {
        if (savedUser) {
          setUser(savedUser);
          setIsAuthenticated(true);
          // Establecer cookie para el middleware
          document.cookie = `auth-token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días
        }
      }).catch(error => {
        console.error('Error cargando usuario guardado:', error);
        // Si falla, limpiar el usuario actual
        clearCurrentUser();
      });
    }
    setLoading(false);
  }, []);

  const login = async (userId: string) => {
    try {
      const selectedUser = await getUserFromAPI(userId);
      if (selectedUser) {
        const authToken = `auth_${userId}_${Date.now()}`;

        setUser(selectedUser);
        setIsAuthenticated(true);

        // Establecer usuario actual para las APIs
        setCurrentUser(userId);

        localStorage.setItem('currentUserId', userId);
        localStorage.setItem('auth-token', authToken);

        // Establecer cookie para el middleware
        document.cookie = `auth-token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días

        console.log('Usuario autenticado:', selectedUser.name);
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    try {
      // Usar API para autenticar
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const { user } = await response.json();

        // Hacer login con el usuario autenticado
        const authToken = `auth_${user.id}_${Date.now()}`;

        setUser(user);
        setIsAuthenticated(true);

        // Establecer usuario actual para las APIs
        setCurrentUser(user.id);

        localStorage.setItem('currentUserId', user.id);
        localStorage.setItem('auth-token', authToken);

        // Establecer cookie para el middleware
        document.cookie = `auth-token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 días

        console.log('Login exitoso con credenciales para:', user.name);
        return true;
      } else {
        console.log('Credenciales inválidas');
        return false;
      }

    } catch (error) {
      console.error('Error durante la autenticación:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    // Limpiar usuario actual de las APIs
    clearCurrentUser();

    localStorage.removeItem('currentUserId');
    localStorage.removeItem('auth-token');

    // Eliminar cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

    console.log('Sesión cerrada');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Actualizar en el sistema unificado
      const { updateUser: updateUserInDB } = require('@/lib/users-data');
      updateUserInDB(user.id, updates);
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      'CEO': 'Director Ejecutivo',
      'ADMIN': 'Administrador',
      'MANAGER': 'Gerente',
      'VENDEDOR': 'Vendedor'
    };
    return roleNames[role] || role;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    loginWithCredentials,
    logout,
    updateUser,
    getRoleDisplayName,
    getInitials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Función para obtener usuarios desde la API (para compatibilidad)
export async function getAvailableUsers(): Promise<User[]> {
  try {
    const response = await fetch('/api/usuarios');
    if (response.ok) {
      const data = await response.json();
      return data.users || [];
    }
    return [];
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}
