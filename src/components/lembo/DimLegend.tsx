import { dimKindMeta, type DimKind } from "@/lib/demo-data";
import type { MeasurementSource } from "@/lib/analysis-contract";
import { cn } from "@/lib/utils";
export const dimStroke: Record<DimKind, string> = { observed: "stroke-dim-observed", calculated: "stroke-dim-calculated", estimated: "stroke-dim-estimated", unknown: "stroke-dim-unknown" };
export const dimFill: Record<DimKind, string> = { observed: "fill-dim-observed", calculated: "fill-dim-calculated", estimated: "fill-dim-estimated", unknown: "fill-dim-unknown" };
export const dimText: Record<DimKind, string> = { observed: "text-dim-observed", calculated: "text-dim-calculated", estimated: "text-dim-estimated", unknown: "text-dim-unknown" };
const dimBorder: Record<DimKind, string> = { observed: "border-dim-observed", calculated: "border-dim-calculated", estimated: "border-dim-estimated border-dashed", unknown: "border-dim-unknown border-dotted" };
export function DimChip({ kind: source }: { kind: MeasurementSource }) {
  const kind: DimKind = source === "provided" ? "observed" : source;
  return <span className={cn("inline-flex rounded border-2 px-1.5 font-mono text-[10px] font-semibold", dimBorder[kind], dimText[kind], source === "provided" && "border-double")}>{source === "provided" ? "FORN" : dimKindMeta[kind].short}</span>;
}
export function DimLegend({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-5")}>
      <div className="rounded-lg border bg-card p-3">
        <div className="flex items-center gap-2"><DimChip kind="provided" /><span className={cn("text-sm font-semibold", dimText.observed)}>Fornecida</span></div>
        {!compact && <p className="mt-1 text-xs text-muted-foreground">Informada pelo usuário; não é deduzida da imagem.</p>}
      </div>
      {(Object.keys(dimKindMeta) as DimKind[]).map((k) => (
        <div key={k} className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2"><DimChip kind={k} /><span className={cn("text-sm font-semibold", dimText[k])}>{dimKindMeta[k].label}</span></div>
          {!compact && <p className="mt-1 text-xs text-muted-foreground">{dimKindMeta[k].desc}</p>}
        </div>
      ))}
    </div>
  );
}
