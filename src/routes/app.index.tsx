import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Plus, Loader2, CheckCircle2, FileStack, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { demoProjects, statusLabel, type ProjectStatus } from "@/lib/demo-data";
import { Thumb } from "@/components/lembo/Thumb";
import { StatusBadge } from "@/components/lembo/StatusBadge";
import { DemoBadge } from "@/components/lembo/DemoBadge";
import { LogoLockup } from "@/components/lembo/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [
    { title: "Painel — LEMBO" },
    { name: "description", content: "Painel de projetos de engenharia da LEMBO." },
    { property: "og:title", content: "Painel — LEMBO" },
    { property: "og:description", content: "Acompanhe projetos em análise e pranchas concluídas." },
  ] }),
  component: Dashboard,
});

const filters: (ProjectStatus | "todos")[] = ["todos", "em_analise", "concluido", "rascunho"];

function Dashboard() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]>("todos");
  const list = useMemo(() => demoProjects.filter((p) => (f === "todos" || p.status === f) && p.name.toLowerCase().includes(q.toLowerCase())), [q, f]);
  const stats = [
    { label: "Total de projetos", value: demoProjects.length, icon: FileStack, tone: "text-primary" },
    { label: "Em andamento", value: demoProjects.filter((p) => p.status === "em_analise" || p.status === "rascunho").length, icon: Loader2, tone: "text-electric" },
    { label: "Concluídos", value: demoProjects.filter((p) => p.status === "concluido").length, icon: CheckCircle2, tone: "text-dim-calculated" },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-navy p-6 text-primary-foreground sm:p-8">
        <div className="absolute inset-0 blueprint-grid-dark" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <LogoLockup className="w-24 shrink-0 sm:w-28" />
          <div className="flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-sky">Painel principal</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Bem-vindo à LEMBO</h1>
            <p className="mt-1 max-w-lg text-sm text-primary-foreground/75">Envie uma foto, esboço ou desenho e receba uma prancha técnica 2D com explicações simples.</p>
          </div>
          <Button asChild variant="electric" size="lg"><Link to="/app/novo"><Plus /> Novo projeto</Link></Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between text-sm text-muted-foreground">{s.label}<s.icon className={cn("h-4 w-4", s.tone)} /></div>
            <div className="mt-2 font-display text-3xl font-bold text-primary">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">Projetos recentes</h2>
          <DemoBadge />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar projetos..." className="bg-card pl-9" /></div>
          <div className="flex flex-wrap gap-1.5">
            {filters.map((x) => (
              <button key={x} onClick={() => setF(x)} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", f === x ? "border-electric bg-electric text-electric-foreground" : "bg-card text-muted-foreground hover:border-electric/50")}>
                {x === "todos" ? "Todos" : statusLabel[x]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <Link key={p.id} to="/app/projetos/$id" params={{ id: p.id }} className="group overflow-hidden rounded-xl border bg-card shadow-card transition hover:-translate-y-0.5 hover:border-electric/50">
              <div className="aspect-[10/7] border-b"><Thumb kind={p.thumb} /></div>
              <div className="space-y-2 p-4">
                <div className="font-semibold text-primary group-hover:text-electric">{p.name}</div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={p.status} />
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground"><CalendarDays className="h-3 w-3" />{new Date(p.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </Link>
          ))}
          {list.length === 0 && <p className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Nenhum projeto encontrado.</p>}
        </div>
      </section>
    </div>
  );
}
