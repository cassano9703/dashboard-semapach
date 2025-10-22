'use client';

import {
  BarChartHorizontal,
  DollarSign,
  Droplets,
  FileText,
  Home,
  Settings,
  Shield,
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
} from '@/components/ui/sidebar';

const navItems = [
  {href: '/', label: 'Inicio', icon: Home},
  {href: '/recaudacion', label: 'Recaudación diaria', icon: DollarSign},
  {href: '/avance-distritos', label: 'Avance de distritos', icon: BarChartHorizontal},
  {href: '/reportes', label: 'Reportes', icon: FileText},
  {href: '/configuracion', label: 'Configuración', icon: Settings},
];

const adminNavItem = { href: '/admin', label: 'Admin', icon: Shield };

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();

  const allNavItems = user ? [...navItems, adminNavItem] : navItems;

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
          {allNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.href === '/'
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
