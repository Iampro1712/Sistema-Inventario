"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/navigation-context';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'product' | 'user' | 'category' | 'page';
  url: string;
  icon?: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { navigate } = useNavigation();

  // Datos simulados para búsqueda
  const searchData: SearchResult[] = [
    // Productos
    { id: '1', title: 'Laptop Dell XPS 13', description: 'Laptop ultrabook 13 pulgadas', type: 'product', url: '/productos?search=Dell+XPS+13' },
    { id: '2', title: 'Mouse Logitech MX Master 3', description: 'Mouse inalámbrico ergonómico', type: 'product', url: '/productos?search=Logitech+MX' },
    { id: '3', title: 'Teclado Mecánico Corsair K95', description: 'Teclado gaming RGB', type: 'product', url: '/productos?search=Corsair+K95' },
    { id: '4', title: 'Monitor Samsung 27"', description: 'Monitor 4K UHD', type: 'product', url: '/productos?search=Samsung+27' },
    { id: '5', title: 'iPhone 15 Pro', description: 'Smartphone Apple 256GB', type: 'product', url: '/productos?search=iPhone+15' },
    
    // Usuarios
    { id: '6', title: 'Juan Pérez', description: 'CEO - Dirección General', type: 'user', url: '/usuarios?search=Juan+Perez' },
    { id: '7', title: 'María García', description: 'Administrador - Administración', type: 'user', url: '/usuarios?search=Maria+Garcia' },
    { id: '8', title: 'Carlos López', description: 'Gerente - Ventas', type: 'user', url: '/usuarios?search=Carlos+Lopez' },
    
    // Categorías
    { id: '9', title: 'Electrónicos', description: 'Categoría de productos electrónicos', type: 'category', url: '/productos?categoria=electronicos' },
    { id: '10', title: 'Computadoras', description: 'Laptops, desktops y accesorios', type: 'category', url: '/productos?categoria=computadoras' },
    { id: '11', title: 'Smartphones', description: 'Teléfonos móviles y accesorios', type: 'category', url: '/productos?categoria=smartphones' },
    
    // Páginas
    { id: '12', title: 'Dashboard', description: 'Panel principal del sistema', type: 'page', url: '/' },
    { id: '13', title: 'Productos', description: 'Gestión de inventario de productos', type: 'page', url: '/productos' },
    { id: '14', title: 'Usuarios', description: 'Administración de usuarios', type: 'page', url: '/usuarios' },
    { id: '15', title: 'Reportes', description: 'Informes y estadísticas', type: 'page', url: '/reportes' },
    { id: '16', title: 'Configuración', description: 'Ajustes del sistema', type: 'page', url: '/configuracion' },
  ];

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simular delay de búsqueda
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const filteredResults = searchData.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8); // Limitar a 8 resultados

    setResults(filteredResults);
    setLoading(false);
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, performSearch]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);
  };

  const selectResult = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    navigate(result.url);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'product': return '📦';
      case 'user': return '👤';
      case 'category': return '📁';
      case 'page': return '📄';
      default: return '🔍';
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'product': return 'Producto';
      case 'user': return 'Usuario';
      case 'category': return 'Categoría';
      case 'page': return 'Página';
      default: return 'Resultado';
    }
  };

  return {
    query,
    results,
    loading,
    isOpen,
    setIsOpen,
    handleSearch,
    selectResult,
    clearSearch,
    getTypeIcon,
    getTypeLabel
  };
}
