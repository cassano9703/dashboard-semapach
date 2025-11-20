
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
  FileText
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
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: Omit<NavItem, 'subItems' | 'icon'>[];
};

const allNavItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home },
  {
    href: '/cobranza',
    label: 'Cobranza',
    icon: Briefcase,
    subItems: [
      { href: '/recaudacion', label: 'Recaudación diaria' },
      { href: '/avance-distritos', label: 'Avance de distritos' },
      {
        href: '/suspendidos-recuperados',
        label: 'Suspendidos Recuperados',
      },
      {
        href: '/recuperados-12-mas',
        label: 'Recuperados 12 a mas',
      },
      {
        href: '/recuperados-2-3-meses',
        label: 'Recuperados 2 a 3 meses',
      },
    ],
  },
  { href: '/medicion', label: 'Medición', icon: Gauge },
  {
    href: '/catastro',
    label: 'Catastro',
    icon: Map,
    subItems: [
      {
        href: '/catastro/clandestinos-e-inspecciones',
        label: 'Clandestinos e Inspecciones',
      },
      {
        href: '/catastro/contratos-cerrados',
        label: 'Contratos Cerrados',
      },
    ],
  },
  { href: '/admin', label: 'Administración', icon: Database },
  { href: '/reportes', label: 'Reportes', icon: FileText },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
];

export function MainNav() {
  const pathname = usePathname();
  const navItems = allNavItems;

  const isSubItemActive = (subItems: NavItem['subItems']) => {
    return subItems?.some((item) => pathname === item.href);
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

  const isRouteActive = (href: string, isParent = false) => {
    if (isParent) {
      return pathname.startsWith(href);
    }
    return pathname === href;
  }

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
              <Collapsible key={item.href} open={openCollapsibles[item.href] || false} onOpenChange={() => handleCollapsibleToggle(item.href)} className="w-full">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <button className={cn("relative flex w-full items-center justify-between rounded-md p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", isRouteActive(item.href, true) && "text-sidebar-accent-foreground font-medium")}>
                       {isRouteActive(item.href, true) && <div className="absolute left-0 h-6 w-1 bg-primary rounded-r-full" />}
                       <div className='flex items-center gap-3 ml-2'>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                       </div>
                       <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibles[item.href] && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <ul className='flex w-full min-w-0 flex-col gap-1 py-1 pl-12'>
                       {item.subItems.map((subItem) => (
                         <SidebarMenuItem key={subItem.href}>
                           <Link
                            href={subItem.href}
                            className={cn(
                              'block w-full rounded-md p-2 text-sm text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                              isRouteActive(subItem.href) &&
                                'bg-sidebar-accent text-sidebar-accent-foreground'
                            )}
                          >
                            {subItem.label}
                           </Link>
                         </SidebarMenuItem>
                       ))}
                    </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <SidebarMenuItem key={item.href}>
                 <Link href={item.href} className={cn("relative flex w-full items-center gap-3 ml-2 rounded-md p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", isRouteActive(item.href) && "text-sidebar-accent-foreground font-medium")}>
                    {isRouteActive(item.href) && <div className="absolute left-[-6px] h-6 w-1 bg-primary rounded-r-full" />}
                    <item.icon className="h-5 w-5"/>
                    <span>{item.label}</span>
                 </Link>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
