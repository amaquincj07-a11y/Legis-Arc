"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Code2,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SuperAdminLGUProvider } from "@/lib/super-admin-lgu-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const SUPER_ADMIN_NAV: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { title: "LGUs", href: "/super-admin/lgus", icon: Building2 },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [];
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    const label = segment
      .replaceAll("-", " ")
      .replaceAll(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

function SuperAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { companyAdmin, logout } = useAuth();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  function handleLogout() {
    void logout().then(() => router.push("/login"));
  }

  return (
    <Sidebar
      collapsible="icon"
      className="bg-linear-to-b from-[#0f172a] to-black/95 text-sidebar-foreground shadow-[4px_0_24px_rgba(0,0,0,0.55)]"
    >
      <SidebarHeader className="border-b border-sidebar-border/60 p-4 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/super-admin/dashboard">
                <div className="flex size-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)]">
                  <Code2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-[13px] font-semibold tracking-wide">
                    Super Admin
                  </span>
                  <span className="truncate text-[11px] text-sidebar-foreground/65">
                    Developer Portal
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground/55">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SUPER_ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/super-admin/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="data-[active=true]:bg-linear-to-r data-[active=true]:from-[rgba(139,92,246,0.2)] data-[active=true]:to-[rgba(57,152,235,0.16)] hover:bg-[rgba(31,41,55,0.9)]/90"
                    >
                      <Link href={item.href}>
                        <Icon className="text-sidebar-foreground/75 group-data-[active=true]/menu-button:text-violet-300" />
                        <span className="text-[13px] font-medium tracking-tight">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Logout"
              className="mt-1 rounded-md border border-sidebar-border/60 bg-black/30 text-[13px] text-sidebar-foreground/80 hover:border-violet-500/50 hover:bg-[rgba(15,23,42,0.9)]"
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {companyAdmin && (
          <>
            <SidebarSeparator />
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="pointer-events-none">
                  <Avatar size="sm">
                    <AvatarFallback className="bg-violet-600 text-[10px] text-white">
                      {getInitials(companyAdmin.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {companyAdmin.name}
                    </span>
                    <span className="truncate text-xs opacity-70">
                      Company Admin
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function SuperAdminHeader() {
  const crumbs = useBreadcrumbs();
  const lastCrumb = crumbs[crumbs.length - 1];

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-4">
      <SidebarTrigger className="-ml-1 shrink-0" />

      <Separator
        orientation="vertical"
        className="mr-1 hidden h-4! sm:mr-2 sm:block"
      />

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          {crumbs.length <= 2 ? (
            crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              return (
                <BreadcrumbItem key={crumb.href} className="min-w-0">
                  {isLast ? (
                    <BreadcrumbPage className="truncate">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <>
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href} className="truncate">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </BreadcrumbItem>
              );
            })
          ) : lastCrumb ? (
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">{lastCrumb.label}</BreadcrumbPage>
            </BreadcrumbItem>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminLGUProvider>
      <SidebarProvider>
        <SuperAdminSidebar />
        <SidebarInset>
          <SuperAdminHeader />
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SuperAdminLGUProvider>
  );
}
