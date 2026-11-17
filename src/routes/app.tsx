import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/lembo/AppSidebar";
import { Button } from "@/components/ui/button";
import { DemoBadge } from "@/components/lembo/DemoBadge";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/90 px-3 backdrop-blur sm:px-5">
            <SidebarTrigger />
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">Engenharia · IA · Precisão</span>
            <div className="ml-auto flex items-center gap-3">
              <DemoBadge text="Modo demonstração" />
              <Button asChild variant="electric" size="sm"><Link to="/app/novo"><Plus /> <span className="hidden sm:inline">Novo projeto</span></Link></Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
