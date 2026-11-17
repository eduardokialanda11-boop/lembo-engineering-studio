import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FileStack, ScanSearch, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/lembo/ProjectList";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { projectStats } from "@/lib/project-state";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/app/")({
  head: () => pageMeta("Painel de Engenharia", "Acompanhe seus projetos e referências visuais para documentação técnica 2D na LEMBO."),
  component: Dashboard,
});
function Dashboard() {
  const { projects } = useProjects();
  const stats = projectStats(projects);
  return <div className="mx-auto max-w-6xl space-y-8">
    <section className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
      <div><p className="text-xs font-medium uppercase text-electric">LEMBO · Visual-to-Engineering</p><h1 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">Painel de Engenharia</h1><p className="mt-2 text-sm text-muted-foreground">Transforme referências visuais em documentação técnica 2D.</p></div>
      <Button asChild variant="electric"><Link to="/app/novo"><Plus />Novo projeto</Link></Button>
    </section>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Indicadores de projetos">
      {[{ label: "Total de projetos", value: stats.total, icon: FileStack, tone: "text-primary" }, { label: "Em análise", value: stats.analysis, icon: ScanSearch, tone: "text-electric" }, { label: "Concluídos", value: stats.completed, icon: CheckCircle2, tone: "text-dim-calculated" }].map((stat) => <div key={stat.label} className="rounded-lg border bg-card p-5 shadow-card"><div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">{stat.label}<stat.icon className={`h-5 w-5 ${stat.tone}`} /></div><p className="mt-3 font-display text-3xl font-bold text-primary" aria-label={`${stat.label}: ${stat.value}`}>{stat.value}</p></div>)}
    </section>
    <ProjectList recent />
  </div>;
}
