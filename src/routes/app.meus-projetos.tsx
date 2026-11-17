import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectList } from "@/components/lembo/ProjectList";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/app/meus-projetos")({ head: () => pageMeta("Meus projetos", "Organize, pesquise e acompanhe seus projetos de engenharia na LEMBO."), component: MyProjects });
function MyProjects() {
  return <div className="mx-auto max-w-6xl space-y-6"><div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6"><div><h1 className="text-2xl font-bold text-primary sm:text-3xl">Meus projetos</h1><p className="mt-2 text-sm text-muted-foreground">Referências visuais e documentação de engenharia.</p></div><Button asChild variant="electric"><Link to="/app/novo"><Plus />Novo projeto</Link></Button></div><ProjectList /></div>;
}