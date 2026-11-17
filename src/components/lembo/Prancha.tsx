import { useEffect, useRef, useState, type ReactNode } from "react";
import { ZoomIn, ZoomOut, Maximize, FileDown, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoDims, demoParts, dimKindMeta, type DimKind } from "@/lib/demo-data";
import { dimFill, dimStroke, dimText, DimChip, DimLegend } from "./DimLegend";
import { cn } from "@/lib/utils";

const SHEET = { w: 840, h: 594 };
type VB = { x: number; y: number; w: number };
const views = {
  all: { label: "Prancha completa", vb: { x: 0, y: 0, w: SHEET.w }, desc: "Todas as vistas organizadas na folha." },
  front: { label: "Vista frontal", vb: { x: 20, y: 50, w: 220 }, desc: "O objeto visto de frente." },
  side: { label: "Vista lateral", vb: { x: 220, y: 50, w: 220 }, desc: "O objeto visto pelo lado." },
  top: { label: "Vista superior", vb: { x: 20, y: 305, w: 240 }, desc: "O objeto visto de cima." },
} satisfies Record<string, { label: string; vb: VB; desc: string }>;
type ViewKey = keyof typeof views;

const dashFor: Record<DimKind, string | undefined> = { observed: undefined, calculated: undefined, estimated: "5 3", unknown: "1.5 2.5" };

function Dim({ id, x1, y1, x2, y2, off, vertical, sel, onSel }: { id: string; x1: number; y1: number; x2: number; y2: number; off: number; vertical?: boolean; sel: string | null; onSel: (id: string) => void }) {
  const d = demoDims.find((x) => x.id === id)!;
  const k = d.kind;
  const active = sel === id;
  const lx1 = vertical ? x1 + off : x1, ly1 = vertical ? y1 : y1 + off, lx2 = vertical ? x2 + off : x2, ly2 = vertical ? y2 : y2 + off;
  const tx = (lx1 + lx2) / 2, ty = (ly1 + ly2) / 2;
  const text = `${d.value}${k === "unknown" ? "" : ""}`;
  return (
    <g className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onSel(id); }}>
      <line x1={x1} y1={y1} x2={vertical ? lx1 + (off > 0 ? 4 : -4) : lx1} y2={vertical ? ly1 : ly1 + (off > 0 ? 4 : -4)} className="stroke-ink/50" strokeWidth={0.5} />
      <line x1={x2} y1={y2} x2={vertical ? lx2 + (off > 0 ? 4 : -4) : lx2} y2={vertical ? ly2 : ly2 + (off > 0 ? 4 : -4)} className="stroke-ink/50" strokeWidth={0.5} />
      <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} className={dimStroke[k]} strokeWidth={active ? 1.6 : 0.9} strokeDasharray={dashFor[k]} markerStart={`url(#a-${k})`} markerEnd={`url(#a-${k})`} />
      <g transform={vertical ? `rotate(-90 ${tx} ${ty})` : undefined}>
        <rect x={tx - 16} y={ty - 11} width={32} height={10} className="fill-paper" />
        <text x={tx} y={ty - 3} textAnchor="middle" className={cn(dimFill[k], "font-mono")} fontSize={8} fontWeight={active ? 700 : 500}>{text}</text>
      </g>
      {active && <rect x={Math.min(lx1, lx2) - 6} y={Math.min(ly1, ly2) - 14} width={Math.abs(lx2 - lx1) + 12} height={Math.abs(ly2 - ly1) + 20} rx={3} className={cn(dimStroke[k], "fill-none")} strokeWidth={0.6} strokeDasharray="2 2" />}
    </g>
  );
}

function Part({ id, sel, onSel, children }: { id: string; sel: string | null; onSel: (id: string) => void; children: ReactNode }) {
  return <g onClick={(e) => { e.stopPropagation(); onSel(id); }} className={cn("cursor-pointer transition-all", sel === id ? "fill-electric/25 stroke-electric" : "fill-paper stroke-ink hover:fill-sky/20")} strokeWidth={sel === id ? 1.8 : 1.2}>{children}</g>;
}
const Balloon = ({ x, y, tx, ty, n }: { x: number; y: number; tx: number; ty: number; n: string }) => (
  <g className="pointer-events-none"><line x1={x} y1={y} x2={tx} y2={ty} className="stroke-ink" strokeWidth={0.5} /><circle cx={x} cy={y} r={7} className="fill-paper stroke-ink" strokeWidth={0.8} /><text x={x} y={y + 2.8} textAnchor="middle" fontSize={7} className="fill-ink font-mono font-semibold">{n}</text></g>
);
const Center = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-dim-unknown/60" strokeWidth={0.4} strokeDasharray="10 2 2 2" />;

export function Prancha({ projectName }: { projectName: string }) {
  const [vb, setVb] = useState<VB>(views.all.vb);
  const [view, setView] = useState<ViewKey>("all");
  const [part, setPart] = useState<string | null>(null);
  const [dim, setDim] = useState<string | null>("d2");
  const ref = useRef<HTMLDivElement>(null);
  const vbRef = useRef(vb); vbRef.current = vb;
  const drag = useRef<{ x: number; y: number; vb: VB } | null>(null);
  const h = (w: number) => (w * SHEET.h) / SHEET.w;

  const zoomAt = (factor: number, fx = 0.5, fy = 0.5) => {
    const v = vbRef.current;
    const nw = Math.min(SHEET.w * 1.5, Math.max(80, v.w / factor));
    setVb({ x: v.x + (v.w - nw) * fx, y: v.y + (h(v.w) - h(nw)) * fy, w: nw });
  };
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
      zoomAt(Math.exp(-dy * 0.0015), (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const selDim = demoDims.find((d) => d.id === dim);
  const selPart = demoParts.find((p) => p.id === part);
  const S = (n: number) => n * 1.2;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b p-2">
          <div className="flex flex-wrap gap-1">
            {Object.entries(views).map(([k, v]) => (
              <button key={k} onClick={() => { setView(k as ViewKey); setVb(v.vb); }} className={cn("rounded-md px-2.5 py-1 text-xs font-medium", view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>{v.label}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button size="icon" variant="ghost" onClick={() => zoomAt(1 / 1.25)} aria-label="Reduzir"><ZoomOut /></Button>
            <span className="w-12 text-center font-mono text-xs text-muted-foreground">{Math.round((SHEET.w / vb.w) * 100)}%</span>
            <Button size="icon" variant="ghost" onClick={() => zoomAt(1.25)} aria-label="Ampliar"><ZoomIn /></Button>
            <Button size="icon" variant="ghost" onClick={() => { setView("all"); setVb(views.all.vb); }} aria-label="Ajustar"><Maximize /></Button>
            <Button size="sm" variant="electric" onClick={() => window.print()}><FileDown /> PDF</Button>
          </div>
        </div>
        <div ref={ref} id="prancha-print" className="relative aspect-[840/594] touch-none select-none bg-muted/50"
          onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY, vb }; }}
          onPointerMove={(e) => { const d = drag.current; if (!d || !ref.current) return; const k = d.vb.w / ref.current.clientWidth; setVb({ ...d.vb, x: d.vb.x - (e.clientX - d.x) * k, y: d.vb.y - (e.clientY - d.y) * k }); }}
          onPointerUp={() => { drag.current = null; }} onPointerLeave={() => { drag.current = null; }}>
          <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${h(vb.w)}`} className="h-full w-full cursor-grab active:cursor-grabbing" onClick={() => setPart(null)}>
            <defs>
              {(["observed", "calculated", "estimated", "unknown"] as DimKind[]).map((k) => (
                <marker key={k} id={`a-${k}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 1 L10 5 L0 9 z" className={dimFill[k]} /></marker>
              ))}
              <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="4" className="stroke-ink/40" strokeWidth="0.6" /></pattern>
            </defs>
            <rect x={0} y={0} width={SHEET.w} height={SHEET.h} className="fill-paper" />
            <rect x={14} y={14} width={SHEET.w - 28} height={SHEET.h - 28} className="fill-none stroke-ink" strokeWidth={1.4} />
            <text x={SHEET.w / 2} y={SHEET.h / 2} textAnchor="middle" fontSize={44} className="fill-dim-estimated/10 font-display font-bold" transform={`rotate(-18 ${SHEET.w / 2} ${SHEET.h / 2})`}>EXEMPLO DEMONSTRATIVO</text>

            {/* VISTA FRONTAL */}
            <text x={60} y={66} fontSize={8} className="fill-ink font-mono font-semibold">VISTA FRONTAL</text>
            <Part id="p2" sel={part} onSel={setPart}><rect x={80} y={80} width={6} height={S(150)} /></Part>
            <Part id="p1" sel={part} onSel={setPart}><rect x={86} y={254} width={S(80) - 6} height={6} /></Part>
            <Part id="p3" sel={part} onSel={setPart}><path d="M86 254 L86 190 L140 254 Z" fill="url(#hatch)" /></Part>
            <Balloon x={120} y={150} tx={84} ty={140} n="P2" />
            <Balloon x={190} y={235} tx={160} ty={256} n="P1" />
            <Balloon x={140} y={200} tx={105} ty={225} n="P3" />
            <Dim id="d3" x1={80} y1={260} x2={80 + S(80)} y2={260} off={22} sel={dim} onSel={setDim} />
            <Dim id="d2" x1={80} y1={80} x2={80} y2={260} off={-26} vertical sel={dim} onSel={setDim} />
            <g onClick={(e) => { e.stopPropagation(); setDim("d5"); }} className="cursor-pointer">
              <line x1={176} y1={257} x2={200} y2={272} className="stroke-dim-unknown" strokeWidth={0.6} strokeDasharray="1.5 2.5" />
              <text x={202} y={276} fontSize={8} className="fill-dim-unknown font-mono" fontWeight={dim === "d5" ? 700 : 500}>t = ? (confirmar)</text>
            </g>

            {/* VISTA LATERAL */}
            <text x={260} y={66} fontSize={8} className="fill-ink font-mono font-semibold">VISTA LATERAL ESQUERDA</text>
            <Part id="p2" sel={part} onSel={setPart}><rect x={270} y={80} width={S(120)} height={S(150) - 6} /></Part>
            <Part id="p1" sel={part} onSel={setPart}><rect x={270} y={254} width={S(120)} height={6} /></Part>
            <line x1={342} y1={190} x2={342} y2={254} className="stroke-ink" strokeWidth={0.8} strokeDasharray="4 2" />
            <Center x1={342} y1={72} x2={342} y2={268} />
            <Dim id="d1" x1={270} y1={260} x2={270 + S(120)} y2={260} off={22} sel={dim} onSel={setDim} />

            {/* VISTA SUPERIOR */}
            <text x={60} y={322} fontSize={8} className="fill-ink font-mono font-semibold">VISTA SUPERIOR</text>
            <Part id="p1" sel={part} onSel={setPart}><rect x={80} y={334} width={S(80)} height={S(120)} /></Part>
            <Part id="p2" sel={part} onSel={setPart}><rect x={80} y={334} width={6} height={S(120)} /></Part>
            <Part id="p3" sel={part} onSel={setPart}><rect x={86} y={404} width={54} height={4} fill="url(#hatch)" /></Part>
            <Part id="p4" sel={part} onSel={setPart}><circle cx={150} cy={358} r={6} /><circle cx={150} cy={454} r={6} /></Part>
            <Center x1={140} y1={358} x2={160} y2={358} /><Center x1={140} y1={454} x2={160} y2={454} /><Center x1={150} y1={346} x2={150} y2={466} />
            <Balloon x={200} y={340} tx={155} ty={354} n="P4" />
            <Dim id="d4" x1={150} y1={358} x2={150} y2={454} off={50} vertical sel={dim} onSel={setDim} />
            <g onClick={(e) => { e.stopPropagation(); setDim("d6"); }} className="cursor-pointer">
              <line x1={145} y1={459} x2={130} y2={490} className="stroke-dim-unknown" strokeWidth={0.6} strokeDasharray="1.5 2.5" />
              <text x={90} y={498} fontSize={8} className="fill-dim-unknown font-mono" fontWeight={dim === "d6" ? 700 : 500}>2× Ø ? (confirmar)</text>
            </g>

            {/* IDENTIFICAÇÃO DAS PEÇAS */}
            <g transform="translate(560 40)">
              <rect width={260} height={22 + demoParts.length * 18} className="fill-paper stroke-ink" strokeWidth={0.8} />
              <text x={8} y={14} fontSize={8} className="fill-ink font-mono font-semibold">IDENTIFICAÇÃO DAS PEÇAS</text>
              {demoParts.map((p, i) => (
                <g key={p.id} transform={`translate(0 ${22 + i * 18})`} onClick={(e) => { e.stopPropagation(); setPart(p.id); }} className="cursor-pointer">
                  <rect width={260} height={18} className={part === p.id ? "fill-electric/15 stroke-ink" : "fill-paper stroke-ink"} strokeWidth={0.4} />
                  <text x={10} y={12} fontSize={7.5} className="fill-ink font-mono font-semibold">{p.code}</text>
                  <text x={40} y={12} fontSize={7.5} className="fill-ink">{p.name}</text>
                </g>
              ))}
            </g>
            {/* LEGENDA */}
            <g transform="translate(560 160)">
              <rect width={260} height={96} className="fill-paper stroke-ink" strokeWidth={0.8} />
              <text x={8} y={14} fontSize={8} className="fill-ink font-mono font-semibold">LEGENDA TÉCNICA</text>
              {(Object.keys(dimKindMeta) as DimKind[]).map((k, i) => (
                <g key={k} transform={`translate(10 ${28 + i * 13})`}>
                  <line x1={0} y1={-3} x2={28} y2={-3} className={dimStroke[k]} strokeWidth={1} strokeDasharray={dashFor[k]} />
                  <text x={36} y={0} fontSize={7} className="fill-ink">Cota {dimKindMeta[k].label.toLowerCase()}</text>
                </g>
              ))}
              <g transform="translate(140 28)">
                <line x1={0} y1={-3} x2={28} y2={-3} className="stroke-ink" strokeWidth={1.2} /><text x={34} y={0} fontSize={7} className="fill-ink">Contorno visível</text>
                <line x1={0} y1={10} x2={28} y2={10} className="stroke-ink" strokeWidth={0.8} strokeDasharray="4 2" /><text x={34} y={13} fontSize={7} className="fill-ink">Aresta oculta</text>
                <line x1={0} y1={23} x2={28} y2={23} className="stroke-dim-unknown/60" strokeWidth={0.6} strokeDasharray="10 2 2 2" /><text x={34} y={26} fontSize={7} className="fill-ink">Linha de centro</text>
              </g>
            </g>
            {/* CARIMBO */}
            <g transform="translate(500 470)">
              <rect width={326} height={110} className="fill-paper stroke-ink" strokeWidth={1.2} />
              <line x1={0} y1={30} x2={326} y2={30} className="stroke-ink" strokeWidth={0.6} />
              <line x1={0} y1={60} x2={326} y2={60} className="stroke-ink" strokeWidth={0.6} />
              <line x1={163} y1={30} x2={163} y2={110} className="stroke-ink" strokeWidth={0.6} />
              <line x1={0} y1={85} x2={326} y2={85} className="stroke-ink" strokeWidth={0.6} />
              <text x={10} y={13} fontSize={6} className="fill-ink/60 font-mono">PROJETO</text>
              <text x={10} y={25} fontSize={10} className="fill-ink font-display font-semibold">{projectName}</text>
              <text x={290} y={22} fontSize={9} textAnchor="end" className="fill-primary font-display font-bold" letterSpacing={2}>LEMBO</text>
              <text x={318} y={22} fontSize={5} textAnchor="end" className="fill-electric font-mono"> </text>
              <text x={10} y={42} fontSize={6} className="fill-ink/60 font-mono">ESCALA</text><text x={10} y={54} fontSize={9} className="fill-ink font-mono">1:1 (ilustrativa)</text>
              <text x={173} y={42} fontSize={6} className="fill-ink/60 font-mono">UNIDADE</text><text x={173} y={54} fontSize={9} className="fill-ink font-mono">mm</text>
              <text x={10} y={72} fontSize={6} className="fill-ink/60 font-mono">DIEDRO</text><text x={10} y={81} fontSize={8} className="fill-ink font-mono">1º diedro</text>
              <text x={173} y={72} fontSize={6} className="fill-ink/60 font-mono">FOLHA</text><text x={173} y={81} fontSize={8} className="fill-ink font-mono">A3 · 1/1</text>
              <text x={10} y={100} fontSize={7} className="fill-dim-estimated font-mono font-semibold">EXEMPLO — NÃO USAR PARA FABRICAÇÃO</text>
              <text x={173} y={100} fontSize={6.5} className="fill-ink font-mono">Visual-to-Engineering</text>
            </g>
          </svg>
          <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded bg-card/90 px-2 py-1 text-[10px] text-muted-foreground"><Hand className="h-3 w-3" /> Arraste para mover · role para ampliar</div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <h3 className="text-sm font-semibold text-primary">{views[view].label}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{views[view].desc}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <h3 className="text-sm font-semibold text-primary">Peça selecionada</h3>
          {selPart ? <div className="mt-2"><div className="font-mono text-xs text-electric">{selPart.code}</div><div className="font-medium">{selPart.name}</div><p className="mt-1 text-xs text-muted-foreground">{selPart.fn}</p></div> : <p className="mt-1 text-xs text-muted-foreground">Clique em uma peça no desenho.</p>}
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <h3 className="text-sm font-semibold text-primary">Dimensões</h3>
          <ul className="mt-2 space-y-1">
            {demoDims.map((d) => (
              <li key={d.id}><button onClick={() => setDim(d.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs", dim === d.id ? "bg-muted" : "hover:bg-muted/60")}>
                <span className="flex items-center gap-2"><DimChip kind={d.kind} />{d.label}</span>
                <span className={cn("font-mono font-semibold", dimText[d.kind])}>{d.value}{d.kind !== "unknown" && " mm"}</span>
              </button></li>
            ))}
          </ul>
          {selDim && <p className={cn("mt-3 rounded-md border p-2 text-xs", dimText[selDim.kind])}>{dimKindMeta[selDim.kind].desc}</p>}
        </div>
        <DimLegend compact />
      </aside>
    </div>
  );
}
