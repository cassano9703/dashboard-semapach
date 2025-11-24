'use client';

import {
  Book,
  Home,
  Settings,
  Target,
  TrendingUp,
  Droplets,
  Database,
  ClipboardCheck,
  Briefcase,
  ChevronDown,
  Gauge,
  Map,
  History,
  Clock3,
  ClipboardList,
  FileLock,
  FileText,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: Omit<NavItem, 'subItems' | 'isCollapsible'>[];
  isCollapsible?: boolean;
};

const allNavItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home },
  {
    href: '/recaudacion',
    label: 'Cobranza',
    icon: Briefcase,
    isCollapsible: true,
    subItems: [
      { href: '/recaudacion', label: 'Recaudación Diaria', icon: TrendingUp },
      { href: '/avance-distritos', label: 'Avance por Distritos', icon: Target },
      { href: '/suspendidos-recuperados', label: 'Suspendidos Recuperados', icon: ClipboardCheck },
      { href: '/recuperados-12-mas', label: 'Recuperados 12+ Meses', icon: History },
      { href: '/recuperados-2-3-meses', label: 'Recuperados 2-3 Meses', icon: Clock3 },
    ],
  },
  {
    href: '/reportes',
    label: 'Reportes',
    icon: FileText,
    isCollapsible: true,
    subItems: [
        {
            href: '/reportes/cobranza',
            label: 'Oficina de Cobranza',
            icon: Building,
        }
    ]
  },
  {
    href: '/medicion',
    label: 'Medición',
    icon: Gauge,
    isCollapsible: true,
    subItems: [{ href: '/medicion/medidores', label: 'Medidores', icon: Gauge }],
  },
  {
    href: '/catastro',
    label: 'Catastro',
    icon: Map,
    isCollapsible: true,
    subItems: [
      {
        href: '/catastro/clandestinos-e-inspecciones',
        label: 'Clandestinos e Inspecciones',
        icon: FileLock,
      },
      {
        href: '/catastro/contratos-cerrados',
        label: 'Contratos Cerrados',
        icon: ClipboardCheck,
      },
    ],
  },
  {
    href: '/admin',
    label: 'Administración',
    icon: Database,
    isCollapsible: true,
    subItems: [
      {
        href: '/admin/cobranza',
        label: 'Admin Cobranza',
        icon: Briefcase,
      },
      {
        href: '/admin/medicion',
        label: 'Admin Medición',
        icon: Gauge,
      },
       {
        href: '/admin/catastro',
        label: 'Admin Catastro',
        icon: Map,
      },
    ]
  },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];


export function MainNav() {
  const pathname = usePathname();
  const navItems = allNavItems;

  const isSubItemActive = (subItems: NavItem['subItems']) => {
    return subItems?.some((item) => pathname.startsWith(item.href));
  };
  
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>(() => {
    const openState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if(item.subItems && isSubItemActive(item.subItems)) {
        openState[item.href] = true;
      }
    });
    return openState;
  });

  const handleCollapsibleToggle = (href: string) => {
    setOpenCollapsibles(prev => ({...prev, [href]: !prev[href]}));
  };

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
          {navItems.map((item) =>
            item.subItems ? (
              <Collapsible key={item.href} open={openCollapsibles[item.href] || false} onOpenChange={() => handleCollapsibleToggle(item.href)}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        data-active={pathname.startsWith(item.href) && isSubItemActive(item.subItems)}
                        className={cn(
                            'w-full justify-between h-8 text-sm p-2 text-left flex items-center gap-2 overflow-hidden rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            pathname.startsWith(item.href) && isSubItemActive(item.subItems) && 'font-medium bg-sidebar-accent text-sidebar-accent-foreground'
                        )}
                        >
                        <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </div>
                        <ChevronDown
                            className={cn('h-4 w-4 transition-transform', openCollapsibles[item.href] && 'rotate-180')}
                        />
                    </Button>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.href}>
                        <SidebarMenuSubButton
                          href={subItem.href}
                          isActive={pathname === subItem.href}
                        >
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  href={item.href}
                  isActive={pathname === item.href}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
