"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'es' | 'en' | 'pt';

interface Translations {
  [key: string]: {
    [key in Language]: string | { [key: string]: string };
  };
}

const translations: Translations = {
  // Navegación
  'nav.dashboard': {
    es: 'Dashboard',
    en: 'Dashboard',
    pt: 'Painel'
  },
  'nav.products': {
    es: 'Productos',
    en: 'Products',
    pt: 'Produtos'
  },
  'nav.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'nav.users': {
    es: 'Usuarios',
    en: 'Users',
    pt: 'Usuários'
  },
  'nav.movements': {
    es: 'Movimientos',
    en: 'Movements',
    pt: 'Movimentos'
  },
  'nav.reports': {
    es: 'Reportes',
    en: 'Reports',
    pt: 'Relatórios'
  },
  'nav.settings': {
    es: 'Configuración',
    en: 'Settings',
    pt: 'Configurações'
  },
  'nav.alerts': {
    es: 'Alertas',
    en: 'Alerts',
    pt: 'Alertas'
  },
  // Dashboard
  'dashboard.title': {
    es: 'Dashboard',
    en: 'Dashboard',
    pt: 'Painel'
  },
  'dashboard.totalProducts': {
    es: 'Total Productos',
    en: 'Total Products',
    pt: 'Total de Produtos'
  },
  'dashboard.totalCategories': {
    es: 'Total Categorías',
    en: 'Total Categories',
    pt: 'Total de Categorias'
  },
  'dashboard.totalUsers': {
    es: 'Total Usuarios',
    en: 'Total Users',
    pt: 'Total de Usuários'
  },
  'dashboard.lowStock': {
    es: 'Stock Bajo',
    en: 'Low Stock',
    pt: 'Estoque Baixo'
  },
  'dashboard.inventoryValue': {
    es: 'Valor Inventario',
    en: 'Inventory Value',
    pt: 'Valor do Inventário'
  },
  'dashboard.categories': {
    es: 'Categorías',
    en: 'Categories',
    pt: 'Categorias'
  },
  'dashboard.movements7d': {
    es: 'Movimientos (7d)',
    en: 'Movements (7d)',
    pt: 'Movimentos (7d)'
  },
  'dashboard.stockAlerts': {
    es: 'Alertas de Stock',
    en: 'Stock Alerts',
    pt: 'Alertas de Estoque'
  },
  'dashboard.recentMovements': {
    es: 'Movimientos Recientes',
    en: 'Recent Movements',
    pt: 'Movimentos Recentes'
  },
  'dashboard.withLowStock': {
    es: 'con stock bajo',
    en: 'with low stock',
    pt: 'com estoque baixo'
  },
  'dashboard.totalEstimatedValue': {
    es: 'Valor total estimado',
    en: 'Total estimated value',
    pt: 'Valor total estimado'
  },
  'dashboard.organizingProducts': {
    es: 'Organizando productos',
    en: 'Organizing products',
    pt: 'Organizando produtos'
  },
  'dashboard.recentActivity': {
    es: 'Actividad reciente',
    en: 'Recent activity',
    pt: 'Atividade recente'
  },
  'dashboard.noLowStock': {
    es: '¡Excelente! No hay productos con stock bajo.',
    en: 'Excellent! No products with low stock.',
    pt: 'Excelente! Nenhum produto com estoque baixo.'
  },
  'dashboard.noRecentMovements': {
    es: 'No hay movimientos recientes.',
    en: 'No recent movements.',
    pt: 'Nenhum movimento recente.'
  },
  'dashboard.outOfStock': {
    es: 'Sin Stock',
    en: 'Out of Stock',
    pt: 'Sem Estoque'
  },
  'dashboard.lowStockBadge': {
    es: 'Stock Bajo',
    en: 'Low Stock',
    pt: 'Estoque Baixo'
  },
  'dashboard.errorLoading': {
    es: 'Error al cargar las estadísticas',
    en: 'Error loading statistics',
    pt: 'Erro ao carregar estatísticas'
  },
  'dashboard.retry': {
    es: 'Reintentar',
    en: 'Retry',
    pt: 'Tentar novamente'
  },
  'dashboard.noDataAvailable': {
    es: 'No hay datos disponibles',
    en: 'No data available',
    pt: 'Nenhum dado disponível'
  },
  'dashboard.movementTypes': {
    es: {
      'IN': 'Entrada',
      'OUT': 'Salida',
      'ADJUSTMENT': 'Ajuste'
    },
    en: {
      'IN': 'Entry',
      'OUT': 'Exit',
      'ADJUSTMENT': 'Adjustment'
    },
    pt: {
      'IN': 'Entrada',
      'OUT': 'Saída',
      'ADJUSTMENT': 'Ajuste'
    }
  },
  // Configuración
  'settings.appearance': {
    es: 'Apariencia',
    en: 'Appearance',
    pt: 'Aparência'
  },
  'settings.theme': {
    es: 'Tema',
    en: 'Theme',
    pt: 'Tema'
  },
  'settings.language': {
    es: 'Idioma',
    en: 'Language',
    pt: 'Idioma'
  },
  'settings.primaryColor': {
    es: 'Color Principal',
    en: 'Primary Color',
    pt: 'Cor Principal'
  },
  'settings.dateFormat': {
    es: 'Formato de fecha',
    en: 'Date Format',
    pt: 'Formato de Data'
  },
  // Botones comunes
  'common.save': {
    es: 'Guardar',
    en: 'Save',
    pt: 'Salvar'
  },
  'common.cancel': {
    es: 'Cancelar',
    en: 'Cancel',
    pt: 'Cancelar'
  },
  'common.edit': {
    es: 'Editar',
    en: 'Edit',
    pt: 'Editar'
  },
  'common.delete': {
    es: 'Eliminar',
    en: 'Delete',
    pt: 'Excluir'
  },
  'common.search': {
    es: 'Buscar',
    en: 'Search',
    pt: 'Pesquisar'
  },
  // Mensajes
  'messages.languageChanged': {
    es: 'Idioma cambiado a',
    en: 'Language changed to',
    pt: 'Idioma alterado para'
  },
  'messages.settingsSaved': {
    es: 'Configuración guardada correctamente',
    en: 'Settings saved successfully',
    pt: 'Configurações salvas com sucesso'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // Cargar idioma desde localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['es', 'en', 'pt'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement.lang = newLanguage;
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    const value = translation[language] || translation.es;
    if (typeof value === 'string') {
      return value;
    }
    // Si es un objeto, devolver el key como fallback
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}