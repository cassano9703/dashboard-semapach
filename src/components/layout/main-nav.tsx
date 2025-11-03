'use client';

import {
  Book,
  Home,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Droplets,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import { useUser } from '@/firebase';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar';

const allNavItems = [
  {href: '/', label: 'Inicio', icon: Home, adminOnly: false},
  {href: '/recaudacion', label: 'Recaudación diaria', icon: TrendingUp, adminOnly: false},
  {href: '/avance-distritos', label: 'Avance de distritos', icon: Target, adminOnly: false},
  {href: '/reportes', label: 'Reportes', icon: Book, adminOnly: false},
  {href: '/configuracion', label: 'Configuración', icon: Settings, adminOnly: true},
];

export function MainNav() {
  const pathname = usePathname();
  const { user, claims } = useUser();
  const isAdmin = claims?.claims?.role === 'admin' || user?.email === 'cassano9703@gmail.com';

  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

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
           {isAdmin && (
            <SidebarMenuItem>
                 <SidebarMenuButton
                    href="/admin"
                    isActive={pathname.startsWith('/admin')}
                    tooltip="Administración"
                 >
                    <Shield />
                    <span>Admin</span>
                 </SidebarMenuButton>
            </SidebarMenuItem>
           )}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
