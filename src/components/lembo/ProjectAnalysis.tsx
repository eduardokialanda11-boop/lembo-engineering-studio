import { useRef, useState } from "react";
import { CheckCircle2, Clock, LoaderCircle, PlugZap, ScanEye, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analysisApi, resolveProjectImage } from "@/lib/integration";
import type { AnalysisInput } from "@/lib/integration";
import { useNavigate } from "@tanstack/react-router";
import { useProjects } from "@/components/lembo/ProjectsProvider";
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
  const [savedId, setSavedId] = useState("");
  const navigate = useNavigate();
  const { acceptAnalysis } = useProjects();
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
      let image = project.originalFile;
      if (!image && project.imageUrl) {
        const response = await fetch(project.imageUrl);
        if (!response.ok) throw new Error("Não foi possível recuperar a imagem original. Tente carregar o projeto novamente.");
        const blob = await response.blob();
        image = new File([blob], project.imageName || `original.${blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type });
      }
      if (!image) throw new Error("Adicione a imagem original.");
      const input: AnalysisInput = { image, name: project.name, description: project.description, dimensions: project.dimensions, notes: project.notes, ...(project.referenceMeasure ? { referenceMeasure: project.referenceMeasure } : {}) };
      const result = await analysisApi.start(input);
      setSavedId(result.project_id);
      const imageUrl = await resolveProjectImage(result.image_path);
      acceptAnalysis?.(project.id, { id: result.project_id, name: result.analysis.title, description: result.analysis.object_summary, analysis: result.analysis, ...(input.referenceMeasure ? { referenceMeasure: input.referenceMeasure } : {}), createdAt: new Date().toISOString(), status: "rascunho", remote: true, isExample: false, imageUrl, dimensions: [], notes: "" });
      await navigate({ to: "/app/projetos/$id", params: { id: result.project_id } });
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
      <Button variant="electric" onClick={start} disabled={busy || Boolean(savedId) || state === "processing" || state === "completed" || project.isExample} className="h-auto min-h-10 max-w-full whitespace-normal py-2 text-left">
        {busy || state === "processing" ? <LoaderCircle className="shrink-0 animate-spin motion-reduce:animate-none" /> : <ScanEye className="shrink-0" />}
        {busy ? "Analisando imagem..." : savedId || state === "completed" ? "Análise salva" : state === "processing" ? "Análise em andamento" : "Iniciar análise de engenharia"}
      </Button>
      <span className={`inline-flex items-center gap-1.5 text-sm ${visual.tone}`} role="status"><Icon className="h-4 w-4 shrink-0" />{visual.label}</span>
    </div>
    {details && <div className="space-y-2 border-l-2 border-electric/30 pl-4 text-sm text-muted-foreground">
      <p>{state === "completed" ? "Resultado preliminar salvo. Confirme informações antes de fabricar." : state === "example" ? "Conteúdo de exemplo, não usar para fabricação." : state === "processing" ? "O projeto está marcado como em análise no Supabase. Aguardando resultados técnicos confirmados." : state === "error" ? "O Supabase informou uma falha na análise. Nenhum resultado técnico foi liberado." : "Ainda não há resultado técnico confirmado para este projeto."}</p>
      {state !== "example" && <p className="flex items-start gap-2"><PlugZap className="mt-0.5 h-4 w-4 shrink-0 text-electric" />{project.analysis ? "Análise preliminar salva; confirme medidas e informações antes de fabricar." : "A imagem é analisada e salva somente após a conclusão do processamento."}</p>}
    </div>}
    {message && <p role={failed ? "alert" : "status"} className={`break-words text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}>{message}</p>}
    {savedId && message && <Button variant="outline" onClick={() => navigate({ to: "/app/projetos/$id", params: { id: savedId } })}>Abrir análise salva</Button>}
  </div>;
}