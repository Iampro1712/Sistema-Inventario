// Cliente API con headers de autenticación simulados
let currentUserId: string | null = null;

// Función para establecer el usuario actual (simulando autenticación)
export function setCurrentUser(userId: string) {
  currentUserId = userId;
}

// Función para obtener el usuario actual
export function getCurrentUserId(): string | null {
  return currentUserId;
}

// Función para limpiar la sesión
export function clearCurrentUser() {
  currentUserId = null;
}

// Función helper para hacer requests con headers de autenticación
export async function apiRequest(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Agregar headers existentes
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  // Agregar header de usuario si está disponible
  if (currentUserId) {
    headers['x-user-id'] = currentUserId;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

// Funciones específicas para cada tipo de request
export const api = {
  get: (url: string, options: RequestInit = {}) => 
    apiRequest(url, { ...options, method: 'GET' }),
  
  post: (url: string, data?: any, options: RequestInit = {}) => 
    apiRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: (url: string, data?: any, options: RequestInit = {}) => 
    apiRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: (url: string, options: RequestInit = {}) => 
    apiRequest(url, { ...options, method: 'DELETE' }),
};
