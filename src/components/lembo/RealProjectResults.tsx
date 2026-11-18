import { useEffect, useState } from "react";
import { assemblyApi, componentsApi } from "@/lib/integration";
import type { Tables } from "@/integrations/supabase/types";
import { dimensionSchema, formatEngineeringDimension } from "@/lib/analysis-contract";
import { DimChip } from "@/components/lembo/DimLegend";
import { Button } from "@/components/ui/button";

export function RealProjectResults({ projectId, kind }: { projectId: string; kind: "pieces" | "assembly" | "explanation" }) {
  const [pieces, setPieces] = useState<Tables<"components">[]>([]);
  const [steps, setSteps] = useState<Tables<"assembly_steps">[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true); setError(""); setPieces([]); setSteps([]);
    const load = async () => {
      try {
        if (kind === "assembly") {
          const rows = await assemblyApi.listByProject(projectId);
          if (active) setSteps(rows);
        } else {
          const rows = await componentsApi.listByProject(projectId);
          if (active) setPieces(rows);
        }
      } catch (reason) { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar os resultados."); }
      finally { if (active) setBusy(false); }
    };
    void load();
    return () => { active = false; };
  }, [projectId, kind, attempt]);
  if (busy) return <p role="status" className="text-sm text-muted-foreground">Carregando resultados salvos...</p>;
  if (error) return <div role="alert" className="space-y-3 text-sm text-destructive"><p>{error}</p><Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</Button></div>;
  if (kind === "assembly") return steps.length ? <ol className="space-y-3">{steps.map((step) => <li key={step.id} className="flex gap-4 rounded-lg border bg-card p-4 shadow-card"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">{step.step_number}</span><div className="min-w-0 space-y-2 break-words text-sm"><h3 className="font-semibold text-primary">{step.title}</h3><p>{step.instruction}</p><p className="text-muted-foreground">{step.component_name}</p>{step.safety_notes && <p className="text-destructive">{step.safety_notes}</p>}{step.estimated_duration_minutes !== null && <p className="text-muted-foreground">Duração estimada: {step.estimated_duration_minutes} min</p>}</div></li>)}</ol> : <p className="text-sm text-muted-foreground">Nenhuma etapa de montagem salva para este projeto.</p>;
  return pieces.length ? <div className="grid gap-3 sm:grid-cols-2">{pieces.map((piece) => <article key={piece.id} className="min-w-0 space-y-3 break-words rounded-lg border bg-card p-4 shadow-card"><h3 className="font-semibold text-primary">{piece.name}</h3><p className="text-sm">Quantidade: {piece.quantity}</p><p className="whitespace-pre-wrap text-sm text-muted-foreground">{kind === "explanation" ? piece.technical_description || piece.description || "Nenhuma explicação salva para esta peça." : piece.description || "Sem descrição salva."}</p>{Array.isArray(piece.dimensions) && <ul className="space-y-2">{piece.dimensions.map((value, i) => { const result = dimensionSchema.safeParse(value); return result.success ? <li key={i} className="flex flex-wrap items-center gap-2 text-sm"><DimChip kind={result.data.source} /><span>{formatEngineeringDimension(result.data)}</span><span className="text-muted-foreground">{result.data.note}</span></li> : <li key={i} className="text-sm text-destructive">Medida salva em formato inválido; confirme os dados antes de fabricar.</li>; })}</ul>}{piece.user_measure && <div className="border-t pt-3 text-sm"><p className="font-medium">Medida registrada</p><p className="font-mono">{piece.user_measure}</p><p className="text-muted-foreground">Origem: {piece.measurement_source || "Não informada; confirme antes de fabricar."}</p></div>}{piece.manufacturing_process && <p className="text-sm text-muted-foreground">{piece.manufacturing_process}</p>}<p className="text-xs text-muted-foreground">Validação registrada: {piece.validation_status}</p></article>)}</div> : <p className="text-sm text-muted-foreground">Nenhuma peça salva para este projeto.</p>;
}