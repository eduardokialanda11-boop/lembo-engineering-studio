import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload, ScanEye, Boxes, Ruler, DraftingCompass, BookOpen, Clock, ImageIcon, PlugZap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/analise")({
  head: () => ({ meta: [
    { title: "Análise técnica — LEMBO" },
    { name: "description", content: "Acompanhe o processamento da imagem e a identificação do objeto." },
    { property: "og:title", content: "Análise técnica — LEMBO" },
    { property: "og:description", content: "Estado do processamento da análise visual da LEMBO." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Analysis,
});

const steps = [
  { icon: Upload, t: "Envio da imagem", d: "Armazenamento seguro da imagem original." },
  { icon: ScanEye, t: "Identificação do objeto", d: "Reconhecimento do tipo de peça ou conjunto." },
  { icon: Boxes, t: "Separação das peças", d: "Cada componente é identificado e nomeado." },
  { icon: Ruler, t: "Dimensões e confiabilidade", d: "Medidas classificadas: observadas, calculadas, estimadas ou desconhecidas." },
  { icon: DraftingCompass, t: "Geração da prancha 2D", d: "Vistas frontal, lateral e superior com cotas." },
  { icon: BookOpen, t: "Interpretação didática", d: "Explicações em linguagem simples." },
];

function Analysis() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-electric">Etapa 2 de 3</p>
        <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">Análise técnica</h1>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-electric/30 bg-electric/5 p-4 text-sm">
        <PlugZap className="mt-0.5 h-5 w-5 shrink-0 text-electric" />
        <p className="text-primary"><strong>Aguardando conexão com o motor de análise.</strong> Esta tela exibirá o progresso e os resultados reais assim que a integração com o backend for concluída. Nenhum resultado é simulado.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border bg-paper blueprint-grid shadow-card">
            <div className="grid aspect-[4/3] place-items-center text-center text-muted-foreground"><div><ImageIcon className="mx-auto h-10 w-10" /><p className="mt-2 text-sm">Imagem original enviada</p></div></div>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-electric/15 to-transparent animate-scan" />
          </div>
          <div className="rounded-xl border bg-card p-5 shadow-card">
            <h2 className="text-sm font-semibold text-primary">Objeto identificado</h2>
            <p className="mt-2 text-sm text-muted-foreground">— aguardando resultado da análise —</p>
            <h2 className="mt-4 text-sm font-semibold text-primary">Informações identificadas</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {["Tipo de objeto", "Quantidade de peças", "Material aparente", "Dimensões detectadas"].map((x) => <li key={x} className="flex justify-between border-b border-dashed pb-1.5"><span>{x}</span><span className="font-mono">—</span></li>)}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-primary">Estado do processamento</h2><span className="font-mono text-xs text-muted-foreground">0 / {steps.length}</span></div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-0 rounded-full bg-electric" /></div>
          <ol className="mt-5 space-y-3">
            {steps.map((s, i) => (
              <li key={s.t} className="flex gap-3 rounded-lg border p-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><s.icon className="h-4 w-4" /></span>
                <div className="flex-1"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium text-primary">{i + 1}. {s.t}</span><span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> Pendente</span></div><p className="text-xs text-muted-foreground">{s.d}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link to="/app/novo">Voltar</Link></Button>
            <Button asChild variant="electric"><Link to="/app/meus-projetos">Meus projetos</Link></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
