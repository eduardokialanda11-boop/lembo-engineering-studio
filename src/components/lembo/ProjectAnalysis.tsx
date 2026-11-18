import { useRef, useState } from "react";
import { CheckCircle2, Clock, LoaderCircle, PlugZap, ScanEye, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analysisApi } from "@/lib/integration";
import type { LocalProject } from "@/lib/project-state";
import { analysisState, validateAnalysisStart } from "@/lib/project-workflow";

const states = {
  waiting: { label: "Aguardando análise", icon: Clock, tone: "text-muted-foreground" },
  processing: { label: "Análise em andamento", icon: LoaderCircle, tone: "text-electric" },
  completed: { label: "Análise concluída", icon: CheckCircle2, tone: "text-dim-calculated" },
  error: { label: "Erro na análise", icon: TriangleAlert, tone: "text-destructive" },
  example: { label: "Resultado de exemplo", icon: ScanEye, tone: "text-electric" },
};

export function ProjectAnalysis({ project, onOpenAnalysis, details = false }: {
  project: LocalProject;
  onOpenAnalysis?: () => void;
  details?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const lock = useRef(false);
  const state = analysisState(project);
  const visual = states[state];
  const Icon = visual.icon;
  async function start() {
    if (lock.current) return;
    lock.current = true;
    setMessage("");
    setFailed(false);
    onOpenAnalysis?.();
    try {
      validateAnalysisStart(project);
      setBusy(true);
      // Only the existing integration point is used. It remains pending until
      // the deployed function and its exact contract can be verified.
      await analysisApi.start(project.originalFile ? { image: project.originalFile, name: project.name, description: project.description, dimensions: project.dimensions, notes: project.notes } : undefined);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar a análise. Tente novamente mais tarde.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return <div className="space-y-3" aria-busy={busy}>
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="electric" onClick={start} disabled={busy || state === "processing" || project.isExample} className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left">
        {busy || state === "processing" ? <LoaderCircle className="shrink-0 animate-spin motion-reduce:animate-none" /> : <ScanEye className="shrink-0" />}
        {busy ? "Verificando integração..." : state === "processing" ? "Análise em andamento" : "Iniciar análise de engenharia"}
      </Button>
      <span className={`inline-flex items-center gap-1.5 text-sm ${visual.tone}`} role="status"><Icon className="h-4 w-4 shrink-0" />{visual.label}</span>
    </div>
    {details && <div className="space-y-2 border-l-2 border-electric/30 pl-4 text-sm text-muted-foreground">
      <p>{state === "example" ? "Conteúdo de exemplo, não usar para fabricação." : state === "processing" ? "O projeto está marcado como em análise no Supabase. Aguardando resultados técnicos confirmados." : state === "error" ? "O Supabase informou uma falha na análise. Nenhum resultado técnico foi liberado." : "Ainda não há resultado técnico confirmado para este projeto."}</p>
      {state !== "example" && <p className="flex items-start gap-2"><PlugZap className="mt-0.5 h-4 w-4 shrink-0 text-electric" />Integração de análise pendente. Nenhum resultado é simulado.</p>}
    </div>}
    {message && <p role={failed ? "alert" : "status"} className={`break-words text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>}
  </div>;
}