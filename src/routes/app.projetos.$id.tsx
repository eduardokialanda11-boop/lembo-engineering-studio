import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { demoParts, demoSteps, demoHistory, demoDims } from "@/lib/demo-data";
import { ProjectImage } from "@/components/lembo/ProjectImage";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { DeleteProjectDialog } from "@/components/lembo/DeleteProjectDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { pageMeta } from "@/lib/page-meta";
import { StatusBadge } from "@/components/lembo/StatusBadge";
import { DemoBadge } from "@/components/lembo/DemoBadge";
import { Prancha } from "@/components/lembo/Prancha";
import { DimLegend, DimChip } from "@/components/lembo/DimLegend";

export const Route = createFileRoute("/app/projetos/$id")({
  head: () => pageMeta("Detalhes do projeto", "Consulte a referência original e acompanhe a documentação técnica 2D do projeto LEMBO."),
  component: ProjectPage,
});

const lessons = [
  { t: "O que são as vistas?", d: "Cada vista é uma 'fotografia plana' do objeto tirada de um lado. A frontal mostra a frente, a lateral mostra o lado e a superior mostra o objeto visto de cima. Juntas, descrevem a forma completa sem precisar de 3D." },
  { t: "O que representam as linhas?", d: "Linha grossa contínua = contorno visível. Linha tracejada = aresta escondida atrás de outra parte. Linha traço-ponto = linha de centro, marca o eixo de furos e simetrias." },
  { t: "O que significam as setas?", d: "As setas nas pontas de uma linha de cota mostram exatamente de onde até onde a medida vale. Setas ligadas a um círculo numerado (balão) apontam para a peça indicada." },
  { t: "O que significam os símbolos?", d: "Ø indica diâmetro (medida de um furo ou eixo redondo). 2× indica que o detalhe se repete duas vezes. 't' indica espessura da chapa. '≈' indica valor aproximado." },
  { t: "Como ler as cotas?", d: "Os números ficam sobre a linha de cota e estão em milímetros. A cor e o tipo de traço mostram a confiabilidade: observada, calculada, estimada ou desconhecida. Nunca fabrique a partir de uma cota estimada ou desconhecida sem confirmar." },
  { t: "Como compreender o desenho?", d: "Comece pela vista frontal, encontre a mesma aresta nas outras vistas (elas estão alinhadas) e use os balões P1, P2... para saber qual peça está olhando." },
];

function ProjectPage() {
  const { id } = Route.useParams();
  const { projects } = useProjects();
  const [deleting, setDeleting] = useState(false);
  const p = projects.find((x) => x.id === id);
  if (!p) return <div className="mx-auto max-w-5xl space-y-4 py-12"><h1 className="text-2xl font-bold text-primary">Projeto indisponível</h1><p className="text-sm text-muted-foreground">Este projeto foi eliminado ou não está disponível nesta sessão temporária.</p><Button asChild variant="outline"><Link to="/app">Voltar ao Dashboard</Link></Button></div>;
  const ready = p.isExample && p.id === "exemplo-suporte";
  const Empty = () => <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">Disponível quando a análise deste projeto for concluída.</div>;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link to="/app" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-electric"><ArrowLeft className="h-4 w-4" /> Painel</Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border"><ProjectImage project={p} /></div>
        <div className="min-w-0 flex-1 break-words">
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-primary sm:text-3xl">{p.name}</h1><StatusBadge status={p.status} /></div>
          <p className="mt-1 text-sm text-muted-foreground">{p.description} · Criado em {new Date(p.createdAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">{p.isExample && <DemoBadge text="Projeto de exemplo" />}<Button variant="outline" className="text-destructive" onClick={() => setDeleting(true)}><Trash2 />Eliminar projeto</Button></div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-dim-estimated/30 bg-dim-estimated/5 p-3 text-xs text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-dim-estimated" />
        {p.isExample ? "Conteúdo de exemplo, não usar para fabricação." : "Projeto temporário desta sessão. Nenhuma análise técnica foi realizada e nenhum dado foi salvo permanentemente."}
      </div>

      <Tabs defaultValue={p.isExample ? "prancha" : "geral"}>
        <div className="overflow-x-auto"><TabsList>
          <TabsTrigger value="geral">Informações</TabsTrigger>
          <TabsTrigger value="prancha">Prancha 2D</TabsTrigger>
          <TabsTrigger value="pecas">Peças</TabsTrigger>
          <TabsTrigger value="didatica">Entenda o desenho</TabsTrigger>
          <TabsTrigger value="montagem">Montagem</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList></div>

        <TabsContent value="geral" className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 shadow-card"><h3 className="mb-3 text-sm font-semibold text-primary">Imagem original</h3><div className="aspect-[10/7] overflow-hidden rounded-lg border"><ProjectImage project={p} /></div></div>
          <div className="space-y-4 rounded-xl border bg-card p-4 shadow-card">
            <h3 className="text-sm font-semibold text-primary">Resultado da análise</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {!ready ? <p className="col-span-2 text-muted-foreground">Aguardando resultado da análise.</p> : [["Objeto", "Suporte em L com reforço"], ["Peças", `${demoParts.length}`], ["Vistas", "Frontal, lateral, superior"], ["Cotas pendentes", `${demoDims.filter((d) => d.kind === "unknown").length}`]].map(([k, v]) => <div key={k} className="rounded-md bg-muted/60 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium text-primary">{v}</dd></div>)}
            </dl>
            <DimLegend compact />
            {!p.isExample && <><h3 className="text-sm font-semibold text-primary">Dimensões informadas (observadas)</h3>{p.dimensions.length ? <dl className="space-y-2">{p.dimensions.map((d, i) => <div key={i} className="flex flex-wrap items-center gap-2 text-sm"><DimChip kind="observed" /><dt className="break-words">{d.label}</dt><dd className="font-mono">{d.value} mm</dd></div>)}</dl> : <p className="text-sm text-muted-foreground">Nenhuma medida informada. Dimensões não determinadas permanecem desconhecidas.</p>}<h3 className="text-sm font-semibold text-primary">Observações adicionais</h3><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{p.notes || "Nenhuma observação informada."}</p></>}
          </div>
        </TabsContent>

        <TabsContent value="prancha" className="mt-4">{ready ? <Prancha projectName={p.name} /> : <Empty />}</TabsContent>

        <TabsContent value="pecas" className="mt-4 grid gap-3 sm:grid-cols-2">
          {!ready && <div className="col-span-full"><Empty /></div>}
          {ready && demoParts.map((x) => (
            <div key={x.id} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-primary font-mono text-xs font-bold text-primary">{x.code}</span><span className="font-semibold text-primary">{x.name}</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{x.fn}</p>
              <ul className="mt-3 space-y-1">{demoDims.filter((d) => d.part === x.id).map((d) => <li key={d.id} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><DimChip kind={d.kind} />{d.label}</span><span className="font-mono">{d.value}{d.kind !== "unknown" && " mm"}</span></li>)}</ul>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="didatica" className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          {!ready ? <div className="lg:col-span-2"><Empty /></div> : <><Accordion type="single" collapsible defaultValue="0" className="rounded-xl border bg-card px-4 shadow-card">
            {lessons.map((l, i) => <AccordionItem key={l.t} value={String(i)}><AccordionTrigger className="text-left text-primary">{l.t}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground">{l.d}</AccordionContent></AccordionItem>)}
          </Accordion>
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4 shadow-card"><h3 className="mb-3 text-sm font-semibold text-primary">Confiabilidade das medidas</h3><DimLegend /></div>
            <div className="rounded-xl border bg-card p-4 shadow-card"><h3 className="mb-2 text-sm font-semibold text-primary">Função de cada peça</h3><ul className="space-y-2 text-sm">{demoParts.map((x) => <li key={x.id}><span className="font-mono text-electric">{x.code}</span> <b className="text-primary">{x.name}:</b> <span className="text-muted-foreground">{x.fn}</span></li>)}</ul></div>
          </div></>}
        </TabsContent>

        <TabsContent value="montagem" className="mt-4">
          {!ready && <Empty />}<ol className="space-y-3">{ready && demoSteps.map((s, i) => <li key={i} className="flex gap-4 rounded-xl border bg-card p-4 shadow-card"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">{i + 1}</span><p className="pt-1.5 text-sm text-primary">{s}</p></li>)}</ol>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <ol className="relative ml-3 border-l pl-6">{(p.isExample ? (ready ? demoHistory : demoHistory.slice(0, 2)) : [{ date: new Date(p.createdAt).toLocaleString("pt-BR"), text: "Projeto criado nesta sessão temporária" }]).map((h) => <li key={h.date} className="mb-5"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-electric" /><div className="font-mono text-xs text-muted-foreground">{h.date}</div><div className="text-sm text-primary">{h.text}</div></li>)}</ol>
        </TabsContent>
      </Tabs>
      <DeleteProjectDialog project={p} open={deleting} onOpenChange={setDeleting} redirect />
    </div>
  );
}
