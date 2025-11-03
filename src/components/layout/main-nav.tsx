'use client';

import {
  Book,
  Home,
  Settings,
  Target,
  TrendingUp,
  Droplets,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const allNavItems = [
  {href: '/', label: 'Inicio', icon: Home},
  {href: '/recaudacion', label: 'Recaudación diaria', icon: TrendingUp},
  {href: '/avance-distritos', label: 'Avance de distritos', icon: Target},
  {href: '/admin', label: 'Administración', icon: Database },
  {href: '/reportes', label: 'Reportes', icon: Book},
  {href: '/configuracion', label: 'Configuración', icon: Settings},
];

export function MainNav() {
  const pathname = usePathname();
  const navItems = allNavItems;

  return (
    <>
      <SidebarHeader className="border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Droplets className="h-6 w-6 text-primary" />
          <span>SEMAPACH</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                href={item.href}
                isActive={
                  item.href === '/'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                tooltip={item.label}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
