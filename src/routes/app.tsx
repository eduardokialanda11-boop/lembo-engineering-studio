import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Plus, Search, Bell, UserRound, Info } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/lembo/AppSidebar";
import { Button } from "@/components/ui/button";
import { ProjectsProvider, useProjects } from "@/components/lembo/ProjectsProvider";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/app")({ component: AppLayout });

function AppLayout() {
  return <ProjectsProvider><AppShell /></ProjectsProvider>;
}

function AppShell() {
  const { query, setQuery, profileName, notices, clearNotices } = useProjects();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center gap-2 border-b bg-card/90 px-3 py-2 backdrop-blur sm:px-5">
            <SidebarTrigger />
            <span className="min-w-0 max-w-40 truncate text-sm font-medium text-primary">Olá, {profileName || "visitante"}</span>
            <div className="relative ml-auto hidden max-w-sm flex-1 md:block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Pesquisa global de projetos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar projetos..." className="pl-9" /></div>
            <div className="ml-auto flex items-center gap-1 md:ml-2">
              <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" aria-label="Notificações" title="Notificações" className="relative"><Bell />{notices.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-electric" />}</Button></PopoverTrigger><PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]"><h2 className="mb-3 text-sm font-semibold text-primary">Notificações</h2>{notices.length ? <><ul className="max-h-64 space-y-3 overflow-y-auto">{notices.map((notice) => <li key={notice.id} className="break-words border-b pb-2 text-sm">{notice.text}</li>)}</ul><Button variant="ghost" size="sm" className="mt-2" onClick={clearNotices}>Limpar notificações</Button></> : <p className="text-sm text-muted-foreground">Nenhuma notificação nesta sessão.</p>}</PopoverContent></Popover>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Menu do perfil" title="Perfil do usuário"><UserRound /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to="/app/perfil">Perfil do usuário</Link></DropdownMenuItem><DropdownMenuItem asChild><Link to="/app/configuracoes">Configurações</Link></DropdownMenuItem></DropdownMenuContent></DropdownMenu>
              <Button asChild variant="electric" size="sm"><Link to="/app/novo" aria-label="Novo projeto"><Plus /> <span className="hidden sm:inline">Novo projeto</span></Link></Button>
            </div>
            <div className="relative order-last w-full md:hidden"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Pesquisa global de projetos" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar projetos..." className="pl-9" /></div>
          </header>
          <div className="flex items-start gap-2 border-b bg-secondary/50 px-4 py-2 text-xs text-muted-foreground sm:px-6"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /><p>Sessão temporária. Projetos não são salvos permanentemente; recarregar a página restaura os exemplos.</p></div>
          <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
