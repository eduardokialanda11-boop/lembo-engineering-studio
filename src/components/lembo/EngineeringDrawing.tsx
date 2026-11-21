import { useState } from "react";
import { Download, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DimChip, DimLegend } from "@/components/lembo/DimLegend";
import { formatEngineeringDimension, type EngineeringAnalysis } from "@/lib/analysis-contract";

// Render only validated primitives from parts_data, never inject returned SVG HTML.
export function EngineeringDrawing({ analysis }: { analysis: EngineeringAnalysis }) {
  const [selected, setSelected] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const views = selected < 0 ? analysis.technical_drawing.views : analysis.technical_drawing.views.filter((_, index) => index === selected);
  return <div id="prancha-print" className="space-y-4 print-sheet">
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button variant={selected < 0 ? "secondary" : "outline"} onClick={() => setSelected(-1)}>Todas as vistas</Button>
      {analysis.technical_drawing.views.map((view, i) => <Button key={i} variant={selected === i ? "secondary" : "outline"} onClick={() => setSelected(i)}>{view.name}</Button>)}
      <Button size="icon" variant="outline" title="Diminuir zoom" aria-label="Diminuir zoom" onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}><ZoomOut /></Button>
      <Button size="icon" variant="outline" title="Aumentar zoom" aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(3, value + 0.25))}><ZoomIn /></Button>
      <Button size="icon" variant="outline" title="Ajustar desenho" aria-label="Ajustar desenho" onClick={() => setZoom(1)}><Maximize /></Button>
      <Button variant="outline" onClick={() => window.print()}><Download />Exportar PDF</Button>
    </div>
    <h2 className="text-xl font-semibold text-primary">{analysis.technical_drawing.title}</h2>
    <p className="text-sm text-muted-foreground">Escala: {analysis.technical_drawing.scale} · Documento preliminar; não liberado para fabricação.</p>
    <DimLegend compact />
    <div className="grid gap-4 lg:grid-cols-2">
      {views.map((view, index) => <section key={`${selected}-${index}`} className="min-w-0 space-y-3 border p-3">
        <h3 className="font-semibold text-primary">{view.name}</h3><p className="break-words text-sm text-muted-foreground">{view.description}</p>
        {view.status === "requested" ? <p className="py-12 text-center text-sm text-muted-foreground">Vista não disponível com os dados atuais.</p> : <div className="overflow-auto border bg-paper"><svg role="img" aria-label={`Desenho ${view.name}`} viewBox={`0 0 ${1000 / zoom} ${1000 / zoom}`} className="aspect-square w-full">
          {view.paths.map((path, i) => <path key={i} d={path.d} className="fill-none stroke-ink" strokeWidth={Math.min(15, path.stroke_width)} />)}
          {view.circles.map((circle, i) => <circle key={i} cx={circle.cx} cy={circle.cy} r={circle.r} className="fill-none stroke-ink" strokeWidth={Math.min(15, circle.stroke_width)} />)}
          {view.dimensions.map((dimension, i) => <g key={i} className={(dimension.source === "observed" || dimension.source === "provided") ? "text-dim-observed" : dimension.source === "calculated" ? "text-dim-calculated" : dimension.source === "estimated" ? "text-dim-estimated" : "text-dim-unknown"}><line x1={dimension.x1} y1={dimension.y1} x2={dimension.x2} y2={dimension.y2} stroke="currentColor" strokeWidth={2} strokeDasharray={dimension.source === "estimated" ? "8 5" : dimension.source === "unknown" ? "3 5" : undefined} /><text x={(dimension.x1 + dimension.x2) / 2} y={(dimension.y1 + dimension.y2) / 2 - 10} textAnchor="middle" fill="currentColor" fontSize={20}>{formatEngineeringDimension(dimension)}</text></g>)}
          {view.callouts.map((callout, i) => <g key={i} className="text-primary"><line x1={callout.x} y1={callout.y} x2={callout.target_x} y2={callout.target_y} stroke="currentColor" strokeWidth={2} /><text x={callout.x} y={callout.y - 10} fill="currentColor" fontSize={22}>{callout.label}</text></g>)}
        </svg></div>}
        <ul className="space-y-2">{view.dimensions.map((dimension, i) => <li key={i} className="flex flex-wrap items-center gap-2 text-sm"><DimChip kind={dimension.source} /><span>{formatEngineeringDimension(dimension)}</span>{dimension.note && <span className="text-muted-foreground">{dimension.note}</span>}</li>)}</ul>
      </section>)}
    </div>
    <ul className="space-y-2 text-sm text-muted-foreground">{analysis.technical_drawing.notes.map((note, i) => <li key={i}>{note}</li>)}</ul>
  </div>;
}