import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MoreVertical, ExternalLink, Trash2, Search, Plus, FolderOpen, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { filterProjects, type LocalProject } from "@/lib/project-state";
import { statusLabel, type ProjectStatus } from "@/lib/demo-data";
import { useProjects } from "./ProjectsProvider";
import { ProjectImage } from "./ProjectImage";
import { StatusBadge } from "./StatusBadge";
import { DemoBadge } from "./DemoBadge";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

export function ProjectList({ recent = false }: { recent?: boolean }) {
  const { projects, query, setQuery, compact } = useProjects();
  const [status, setStatus] = useState<ProjectStatus | "todos">("todos");
  const [deleting, setDeleting] = useState<LocalProject | null>(null);
  const filtered = filterProjects(projects, query, status);
  const list = recent ? filtered.slice(0, 4) : filtered;
  return <section className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold text-primary">{recent ? "Projetos recentes" : `${filtered.length} projeto${filtered.length === 1 ? "" : "s"}`}</h2>{recent && <Button asChild variant="link" size="sm"><Link to="/app/meus-projetos">Ver todos <ExternalLink /></Link></Button>}</div>
    <div className="flex flex-col gap-3 xl:flex-row">
      <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Pesquisar projetos por nome" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar projetos por nome..." className="bg-card pl-9" /></div>
      <div className="flex flex-wrap gap-1" aria-label="Filtrar por status">{(["todos", "rascunho", "em_analise", "concluido", "erro"] as const).map((value) => <Button key={value} size="sm" variant={status === value ? "secondary" : "ghost"} aria-pressed={status === value} onClick={() => setStatus(value)}>{value === "todos" ? "Todos" : statusLabel[value]}</Button>)}</div>
    </div>
    <div className={`grid gap-4 sm:grid-cols-2 ${recent ? "xl:grid-cols-4" : "lg:grid-cols-3"}`}>
      {list.map((project) => <article key={project.id} className="group min-w-0 overflow-hidden rounded-lg border bg-card shadow-card transition-colors hover:border-electric/50">
        <Link to="/app/projetos/$id" params={{ id: project.id }} aria-label={`Abrir ${project.name}`} className="block aspect-[10/7] overflow-hidden border-b bg-paper"><ProjectImage project={project} /></Link>
        <div className={compact ? "space-y-2 p-3" : "space-y-3 p-4"}>
          <div className="flex items-start gap-2"><Link to="/app/projetos/$id" params={{ id: project.id }} className="min-w-0 flex-1 break-words font-semibold text-primary hover:text-electric">{project.name}</Link><DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={`Opções de ${project.name}`} title="Opções do projeto" size="icon" variant="ghost" className="-mt-1 h-8 w-8 shrink-0"><MoreVertical /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem asChild><Link to="/app/projetos/$id" params={{ id: project.id }}><ExternalLink />Abrir projeto</Link></DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setDeleting(project)}><Trash2 />Eliminar projeto</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
          <p className={`${compact ? "line-clamp-1" : "line-clamp-2 min-h-10"} break-words text-sm text-muted-foreground`}>{project.description || "Sem descrição."}</p>
          <StatusBadge status={project.status} />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3"><span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="h-3 w-3" />{new Date(project.createdAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span>{project.isExample ? <DemoBadge text="Exemplo" /> : <span className="text-xs text-muted-foreground">Temporário</span>}</div>
        </div>
      </article>)}
    </div>
    {list.length === 0 && <div className="flex flex-col items-center gap-3 border-y border-dashed py-14 text-center"><FolderOpen className="h-9 w-9 text-muted-foreground" /><h3 className="font-semibold text-primary">{projects.length === 0 ? "Ainda não há projetos" : "Nenhum projeto encontrado"}</h3><p className="text-sm text-muted-foreground">{projects.length === 0 ? "Crie seu primeiro projeto de engenharia." : "Nenhum projeto corresponde à pesquisa e ao status selecionados."}</p>{projects.length === 0 ? <Button asChild variant="electric"><Link to="/app/novo"><Plus />Novo projeto</Link></Button> : <Button variant="outline" onClick={() => { setQuery(""); setStatus("todos"); }}>Limpar filtros</Button>}</div>}
    {deleting && <DeleteProjectDialog project={deleting} open onOpenChange={(open) => { if (!open) setDeleting(null); }} />}
  </section>;
}