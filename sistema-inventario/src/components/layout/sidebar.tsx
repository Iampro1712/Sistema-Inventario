"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Home,
  Package,
  Tags,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/contexts/navigation-context";
import { usePermissions } from "@/hooks/use-permissions";
import { useLanguage } from "@/contexts/language-context";

const allNavigation = [
  { nameKey: "nav.dashboard", href: "/", icon: Home, section: "dashboard" },
  { nameKey: "nav.products", href: "/productos", icon: Package, section: "productos" },
  { nameKey: "nav.categories", href: "/categorias", icon: Tags, section: "categorias" },
  { nameKey: "nav.movements", href: "/movimientos", icon: TrendingUp, section: "movimientos" },
  { nameKey: "nav.alerts", href: "/alertas", icon: AlertTriangle, section: "alertas" },
  { nameKey: "nav.reports", href: "/reportes", icon: BarChart3, section: "reportes" },
  { nameKey: "nav.users", href: "/usuarios", icon: Users, section: "usuarios" },
  { nameKey: "nav.settings", href: "/configuracion", icon: Settings, section: "configuracion" },
];

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { navigate } = useNavigation();
  const { checkSectionAccess } = usePermissions();
  const { t } = useLanguage();

  // Filtrar navegación basada en permisos
  const navigation = allNavigation.filter(item =>
    checkSectionAccess(item.section)
  );

  return (
    <>
      {/* Sidebar móvil */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Cerrar sidebar</span>
                      <X className="h-6 w-6 text-foreground" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto sidebar-gradient px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center gap-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg animate-glow">
                        <Package className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        Inventrix
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.nameKey}>
                              <button
                                onClick={() => {
                                  setOpen(false);
                                  navigate(item.href);
                                }}
                                className={cn(
                                  "nav-item group flex gap-x-3 p-3 text-sm leading-6 font-medium w-full text-left",
                                  pathname === item.href
                                    ? "active text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    "h-6 w-6 shrink-0 transition-all duration-300",
                                    pathname === item.href
                                      ? "text-primary-foreground drop-shadow-lg"
                                      : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.nameKey.startsWith('nav.') ? t(item.nameKey) : item.nameKey}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Sidebar estático para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto sidebar-gradient px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-xl animate-glow">
                <Package className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
                Inventrix
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.nameKey}>
                      <button
                        onClick={() => navigate(item.href)}
                        className={cn(
                          "nav-item group flex gap-x-3 p-3 text-sm leading-6 font-medium w-full text-left",
                          pathname === item.href
                            ? "active text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-6 w-6 shrink-0 transition-all duration-300",
                            pathname === item.href
                              ? "text-primary-foreground drop-shadow-lg"
                              : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                          )}
                          aria-hidden="true"
                        />
                        {item.nameKey.startsWith('nav.') ? t(item.nameKey) : item.nameKey}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
