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
        icon: ClipboardCheck,
      },
    ],
  },
  { href: '/medicion', label: 'Medición', icon: Gauge },
  { href: '/catastro', label: 'Catastro', icon: Map },
  { href: '/admin', label: 'Administración', icon: Database },
  { href: '/reportes', label: 'Reportes', icon: Book },
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
              <Collapsible key={item.href} open={openCollapsibles[item.href] || false} onOpenChange={() => handleCollapsibleToggle(item.href)} className="w-full">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <button className={cn("flex w-full items-center justify-between rounded-md p-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", (isSubItemActive(item.subItems) || pathname.startsWith(item.href)) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                       <div className='flex items-center gap-2'>
                        <item.icon />
                        <span>{item.label}</span>
                       </div>
                       <ChevronDown className={cn("h-4 w-4 transition-transform", openCollapsibles[item.href] && "rotate-180")} />
                    </button>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                    <ul className='flex w-full min-w-0 flex-col gap-1 py-1 pl-6'>
                       {item.subItems.map((subItem) => (
                         <SidebarMenuItem key={subItem.href}>
                           <SidebarMenuButton
                            href={subItem.href}
                            isActive={pathname.startsWith(subItem.href)}
                            tooltip={subItem.label}
                          >
                            <subItem.icon />
                            <span>{subItem.label}</span>
                           </SidebarMenuButton>
                         </SidebarMenuItem>
                       ))}
                    </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
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
            )
          )}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
