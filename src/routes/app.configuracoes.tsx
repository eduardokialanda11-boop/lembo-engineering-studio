import { createFileRoute } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/app/configuracoes")({ head: () => pageMeta("Configurações", "Preferências de apresentação dos projetos da LEMBO nesta sessão."), component: Settings });
function Settings() {
  const { compact, setCompact } = useProjects();
  return <div className="mx-auto max-w-3xl space-y-6"><h1 className="text-2xl font-bold text-primary">Configurações</h1><section className="flex items-center justify-between gap-4 border-y py-5"><Label htmlFor="compact">Cartões compactos</Label><Switch id="compact" checked={compact} onCheckedChange={setCompact} /></section><p className="text-sm text-muted-foreground">Preferências temporárias desta sessão. Unidade das dimensões: milímetros (mm).</p></div>;
}