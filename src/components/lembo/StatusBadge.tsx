import { cn } from "@/lib/utils";
import { statusLabel, type ProjectStatus } from "@/lib/demo-data";
const tone: Record<ProjectStatus, string> = {
  rascunho: "bg-muted text-muted-foreground",
  em_analise: "bg-electric/10 text-electric",
  concluido: "bg-dim-calculated/10 text-dim-calculated",
  erro: "bg-destructive/10 text-destructive",
};
export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tone[status])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{statusLabel[status]}</span>;
}
