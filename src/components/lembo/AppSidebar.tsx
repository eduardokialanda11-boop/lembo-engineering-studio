import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, PlusCircle, Activity, FolderKanban, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { LogoMark } from "./Logo";

const items = [
  { title: "Painel", url: "/app", icon: LayoutDashboard },
  { title: "Novo projeto", url: "/app/novo", icon: PlusCircle },
  { title: "Análise técnica", url: "/app/analise", icon: Activity },
  ] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app" className="flex items-center gap-3 px-1 py-2">
          <LogoMark className="w-9" />
          {!collapsed && (
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-[0.18em] text-sidebar-accent-foreground">LEMBO</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-sky">Visual-to-Engineering</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">Plataforma</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={path === i.url} tooltip={i.title}>
                    <Link to={i.url}><i.icon /><span>{i.title}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path.startsWith("/app/projetos")} tooltip="Projeto de exemplo">
                  <Link to="/app/projetos/$id" params={{ id: "exemplo-suporte" }}><FolderKanban /><span>Projeto de exemplo</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton asChild tooltip="Sair"><Link to="/"><LogOut /><span>Sair</span></Link></SidebarMenuButton></SidebarMenuItem></SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
