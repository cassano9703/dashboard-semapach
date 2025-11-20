
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  subItems?: Omit<NavItem, 'subItems'>[];
};

const allNavItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: Home },
  {
    href: '/cobranza',
    label: 'Cobranza',
    icon: Briefcase,
    subItems: [
      { href: '/recaudacion', label: 'Recaudación diaria', icon: TrendingUp },
      { href: '/avance-distritos', label: 'Avance de distritos', icon: Target },
      {
        href: '/suspendidos-recuperados',
        label: 'Suspendidos Recuperados',
        icon: History,
      },
      {
        href: '/recuperados-12-mas',
        label: 'Recuperados 12 a mas',
        icon: Clock3,
      },
      {
        href: '/recuperados-2-3-meses',
        label: 'Recuperados 2 a 3 meses',
        icon: ClipboardList,
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
        icon: FileLock,
      },
      {
        href: '/catastro/contratos-cerrados',
        label: 'Contratos Cerrados',
        icon: ClipboardCheck,
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
                    <SidebarMenuButton
                      href={item.href}
                      isActive={isSubItemActive(item.subItems)}
                      className="w-full justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibles[item.href] && "rotate-180")} />
                    </SidebarMenuButton>
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
