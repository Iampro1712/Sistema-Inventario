"use client";

import { useState } from "react";
import { User, Settings, LogOut, UserCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";

export function UserProfileDropdown() {
  const { user, loading, logout, getRoleDisplayName, getInitials } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleEditProfile = () => {
    router.push('/perfil');
    setIsOpen(false);
  };



  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CEO': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'MANAGER': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'VENDEDOR': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading || !user) {
    return (
      <Button variant="ghost" size="sm" className="flex items-center gap-x-2" disabled>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <span className="hidden lg:flex lg:items-center">
          <span className="ml-2 text-sm font-medium text-muted-foreground">Cargando...</span>
        </span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-x-2 hover:bg-muted/50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden lg:flex lg:items-center">
            <div className="ml-2 text-left">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{getRoleDisplayName(user.role)}</p>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getRoleColor(user.role)}>
                {getRoleDisplayName(user.role)}
              </Badge>
              {user.department && (
                <Badge variant="outline" className="text-xs">
                  {user.department}
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEditProfile} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Editar perfil</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => {
            router.push('/configuracion');
            setIsOpen(false);
          }} 
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Configuración</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
