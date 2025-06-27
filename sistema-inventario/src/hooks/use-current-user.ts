"use client";

import { useAuth } from '@/contexts/auth-context';

// Re-exportar el tipo User del contexto como CurrentUser para compatibilidad
export type { User as CurrentUser } from '@/contexts/auth-context';

export function useCurrentUser() {
  return useAuth();
}
