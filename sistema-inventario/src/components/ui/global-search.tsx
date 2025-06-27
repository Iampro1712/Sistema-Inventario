"use client";

import { useRef, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGlobalSearch } from "@/hooks/use-global-search";

export function GlobalSearch() {
  const {
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
  } = useGlobalSearch();

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Manejar teclas
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSearch();
      }
      if (event.key === '/' && event.ctrlKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearSearch]);

  return (
    <div ref={searchRef} className="relative flex flex-1">
      <label htmlFor="search-field" className="sr-only">
        Buscar
      </label>
      <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground pl-3" />
      <Input
        ref={inputRef}
        id="search-field"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        className="block h-full w-full border-0 py-0 pl-10 pr-0 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm bg-transparent"
        placeholder="Buscar productos, categorías..."
        type="search"
        name="search"
      />
      {loading && (
        <Loader2 className="absolute inset-y-0 right-0 h-full w-5 text-muted-foreground pr-3 animate-spin" />
      )}

      {/* Resultados de búsqueda */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                Resultados de búsqueda
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => selectResult(result)}
                  className="w-full px-3 py-3 text-left hover:bg-muted/50 focus:bg-muted/50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getTypeIcon(result.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron resultados para "{query}"</p>
              <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Busca productos, usuarios o páginas</p>
              <p className="text-xs mt-1">Escribe para comenzar a buscar</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
