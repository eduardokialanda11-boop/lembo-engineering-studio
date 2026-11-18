import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Clock, Info, Trash2, ScanEye, LoaderCircle, TriangleAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { demoParts, demoSteps, demoHistory, demoDims } from "@/lib/demo-data";
import { ProjectImage } from "@/components/lembo/ProjectImage";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { DeleteProjectDialog } from "@/components/lembo/DeleteProjectDialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { EngineeringDrawing } from "@/components/lembo/EngineeringDrawing";
import { formatEngineeringDimension } from "@/lib/analysis-contract";
import { RealProjectResults } from "@/components/lembo/RealProjectResults";
import { pageMeta } from "@/lib/page-meta";
import { StatusBadge } from "@/components/lembo/StatusBadge";
import { DemoBadge } from "@/components/lembo/DemoBadge";
import { Prancha } from "@/components/lembo/Prancha";
import { DimLegend, DimChip } from "@/components/lembo/DimLegend";
import { ProjectAnalysis } from "@/components/lembo/ProjectAnalysis";
import { analysisState, canOpenStage, hasExampleResults, projectStages, stageState, type ProjectStage } from "@/lib/project-workflow";

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

export function ProjectPage() {
  const { id } = Route.useParams();
  const { projects, loading, loadProject } = useProjects();
  const [deleting, setDeleting] = useState(false);
  const [selection, setSelection] = useState<{ projectId: string; stage: ProjectStage } | null>(null);
  const p = projects.find((x) => x.id === id);
  const [fetchError, setFetchError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!loadProject || p) return;
    let active = true;
    setFetching(true); setFetchError("");
    loadProject(id).catch((reason) => { if (active) setFetchError(reason instanceof Error ? reason.message : "Não foi possível buscar o projeto."); }).finally(() => { if (active) setFetching(false); });
    return () => { active = false; };
  }, [id, Boolean(p), attempt]);
  if (!p && (loading || fetching)) return <p role="status">Carregando projeto...</p>;
  if (!p) return <div className="mx-auto max-w-5xl space-y-4 py-12"><h1 className="text-2xl font-bold text-primary">Projeto indisponível</h1><p role={fetchError ? "alert" : undefined} className="text-sm text-muted-foreground">{fetchError || "Este projeto não existe, foi eliminado ou não pertence à sua conta."}</p>{fetchError && <Button variant="outline" onClick={() => setAttempt((value) => value + 1)}>Tentar novamente</Button>}<Button asChild variant="outline"><Link to="/app">Voltar ao Dashboard</Link></Button></div>;
  const ready = hasExampleResults(p);
  const selected = selection?.projectId === id ? selection.stage : "geral";
  const stage = canOpenStage(p, selected) ? selected : "analise";
  const index = projectStages.findIndex((item) => item.id === stage);
  const previous = projectStages[index - 1];
  const next = projectStages[index + 1];
  const selectStage = (value: string) => { if (canOpenStage(p, value)) setSelection({ projectId: id, stage: value }); };
  const state = analysisState(p);
  const Empty = () => <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">Disponível quando a análise deste projeto for concluída.</div>;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Button asChild variant="ghost" size="sm"><Link to="/app/meus-projetos"><ArrowLeft className="h-4 w-4" /> Meus projetos</Link></Button>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg border"><ProjectImage project={p} /></div>
        <div className="min-w-0 flex-1 break-words">
          <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold text-primary sm:text-3xl">{p.name}</h1>{p.isExample ? <DemoBadge text="Projeto de exemplo" /> : <StatusBadge status={state === "processing" ? "em_analise" : state === "error" ? "erro" : "rascunho"} />}</div>
          <p className="mt-1 text-sm text-muted-foreground">{p.description} · Criado em {new Date(p.createdAt).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
          <div className="mt-4"><ProjectAnalysis key={p.id} project={p} onOpenAnalysis={() => selectStage("analise")} /></div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">{p.isExample && <DemoBadge text="Projeto de exemplo" />}<Button variant="outline" className="text-destructive" onClick={() => setDeleting(true)}><Trash2 />Eliminar projeto</Button></div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-dim-estimated/30 bg-dim-estimated/5 p-3 text-xs text-primary">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-dim-estimated" />
        {p.isExample ? "Conteúdo de exemplo, não usar para fabricação." : p.remote ? "Projeto salvo no Supabase. Os resultados técnicos só serão liberados após confirmação da análise real." : "Projeto temporário desta sessão. Nenhuma análise técnica foi realizada e nenhum dado foi salvo permanentemente."}
      </div>

      <Tabs value={stage} onValueChange={selectStage}>
        <TabsList aria-label="Etapas do projeto" className="grid h-auto w-full grid-cols-1 gap-1 bg-muted/50 p-1 sm:grid-cols-2 xl:grid-cols-7">
          {projectStages.map((item, i) => {
            const status = stageState(p, item.id);
            const Icon = status === "Concluída" ? Check : status === "Em andamento" ? LoaderCircle : Clock;
            return <TabsTrigger key={item.id} value={item.id} disabled={!canOpenStage(p, item.id)} aria-current={stage === item.id ? "step" : undefined} className="min-h-14 min-w-0 justify-start gap-2 whitespace-normal px-3 py-2 text-left">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-xs">{i + 1}</span>
              <span className="min-w-0"><span className="block text-xs font-semibold">{item.label}</span><span className="mt-1 flex items-center gap-1 text-[10px] font-normal text-muted-foreground"><Icon className="h-3 w-3 shrink-0" />{status}</span></span>
            </TabsTrigger>;
          })}
        </TabsList>

        <TabsContent value="geral" className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 shadow-card"><h3 className="mb-3 text-sm font-semibold text-primary">Imagem original</h3><div className="aspect-[10/7] overflow-hidden rounded-lg border"><ProjectImage project={p} /></div></div>
          <div className="space-y-4 rounded-xl border bg-card p-4 shadow-card">
            <h3 className="text-sm font-semibold text-primary">Resultado da análise</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              {p.analysis ? <><div className="col-span-2"><dt>Objeto</dt><dd>{p.analysis.object_summary}</dd></div><div><dt>Peças</dt><dd>{p.analysis.components.length}</dd></div><div><dt>Resultado</dt><dd>{p.analysis.analysis_status === "needs_more_information" ? "Requer informações adicionais" : "Preliminar"}</dd></div></> : !ready ? <p className="col-span-2 text-muted-foreground">Aguardando resultado da análise.</p> : [["Objeto", "Suporte em L com reforço"], ["Peças", `${demoParts.length}`], ["Vistas", "Frontal, lateral, superior"], ["Cotas pendentes", `${demoDims.filter((d) => d.kind === "unknown").length}`]].map(([k, v]) => <div key={k} className="rounded-md bg-muted/60 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium text-primary">{v}</dd></div>)}
            </dl>
            <DimLegend compact />
            {p.analysis && <ul className="space-y-2">{p.analysis.dimensions.map((dimension, i) => <li key={i} className="flex flex-wrap items-center gap-2 text-sm"><DimChip kind={dimension.source} /><span>{formatEngineeringDimension(dimension)}</span><span className="text-muted-foreground">{dimension.note}</span></li>)}</ul>}
            {p.referenceMeasure && <div className="space-y-2 text-sm"><h3 className="font-semibold text-primary">Referência enviada</h3><p className="whitespace-pre-wrap break-words">{p.referenceMeasure}</p></div>}
            {!p.isExample && <><h3 className="text-sm font-semibold text-primary">Dimensões informadas (observadas)</h3>{p.dimensions.length ? <dl className="space-y-2">{p.dimensions.map((d, i) => <div key={i} className="flex flex-wrap items-center gap-2 text-sm"><DimChip kind="observed" /><dt className="break-words">{d.label}</dt><dd className="font-mono">{d.value} mm</dd></div>)}</dl> : <p className="text-sm text-muted-foreground">Nenhuma medida informada. Dimensões não determinadas permanecem desconhecidas.</p>}<h3 className="text-sm font-semibold text-primary">Observações adicionais</h3><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{p.notes || "Nenhuma observação informada."}</p></>}
          </div>
        </TabsContent>

        <TabsContent value="analise" className="mt-6 space-y-5">
          <h2 className="text-xl font-semibold text-primary">Análise de engenharia</h2>
          <div className="flex items-start gap-3 border-l-2 border-electric/30 py-2 pl-4" role="status">
            {state === "error" ? <TriangleAlert className="h-6 w-6 shrink-0 text-destructive" /> : state === "processing" ? <LoaderCircle className="h-6 w-6 shrink-0 animate-spin text-electric motion-reduce:animate-none" /> : <ScanEye className="h-6 w-6 shrink-0 text-electric" />}
            <div className="space-y-2 text-sm"><p className="font-semibold text-primary">{p.analysis ? "Análise preliminar salva" : ready ? "Resultado de exemplo" : state === "processing" ? "Análise em andamento" : state === "error" ? "Erro na análise" : "Aguardando análise"}</p><p className="text-muted-foreground">{p.analysis?.object_summary || (ready ? "Conteúdo demonstrativo. Não usar para fabricação." : "Nenhum resultado técnico confirmado foi recebido.")}</p>{p.analysis && <><ul className="space-y-2 text-dim-unknown">{p.analysis.unknowns.map((item, i) => <li key={i}>{item}</li>)}</ul><ul className="space-y-2 text-destructive">{p.analysis.safety_warnings.map((item, i) => <li key={i}>{item}</li>)}</ul><p className="text-muted-foreground">Resultado preliminar; não representa certificação nem liberação para fabricação.</p></>}</div>
          </div>
          <DimLegend compact />
          {!ready && !p.analysis && <p className="text-sm text-muted-foreground">Prancha, peças, explicações e montagem permanecem pendentes.</p>}
        </TabsContent>

        <TabsContent value="prancha" className="mt-4">{p.analysis ? <EngineeringDrawing analysis={p.analysis} /> : ready ? <Prancha projectName={p.name} /> : <Empty />}</TabsContent>

        <TabsContent value="pecas" className="mt-4 grid gap-3 sm:grid-cols-2">
          {p.remote ? <div className="col-span-full"><RealProjectResults projectId={p.id} kind="pieces" /></div> : !ready && <div className="col-span-full"><Empty /></div>}
          {ready && demoParts.map((x) => (
            <div key={x.id} className="rounded-xl border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border-2 border-primary font-mono text-xs font-bold text-primary">{x.code}</span><span className="font-semibold text-primary">{x.name}</span></div>
              <p className="mt-2 text-sm text-muted-foreground">{x.fn}</p>
              <ul className="mt-3 space-y-1">{demoDims.filter((d) => d.part === x.id).map((d) => <li key={d.id} className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><DimChip kind={d.kind} />{d.label}</span><span className="font-mono">{d.value}{d.kind !== "unknown" && " mm"}</span></li>)}</ul>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="didatica" className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          {p.remote ? <div className="lg:col-span-2"><RealProjectResults projectId={p.id} kind="explanation" /></div> : !ready ? <div className="lg:col-span-2"><Empty /></div> : <><Accordion type="single" collapsible defaultValue="0" className="rounded-xl border bg-card px-4 shadow-card">
            {lessons.map((l, i) => <AccordionItem key={l.t} value={String(i)}><AccordionTrigger className="text-left text-primary">{l.t}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground">{l.d}</AccordionContent></AccordionItem>)}
          </Accordion>
          <div className="space-y-4">
            <div className="rounded-xl border bg-card p-4 shadow-card"><h3 className="mb-3 text-sm font-semibold text-primary">Confiabilidade das medidas</h3><DimLegend /></div>
            <div className="rounded-xl border bg-card p-4 shadow-card"><h3 className="mb-2 text-sm font-semibold text-primary">Função de cada peça</h3><ul className="space-y-2 text-sm">{demoParts.map((x) => <li key={x.id}><span className="font-mono text-electric">{x.code}</span> <b className="text-primary">{x.name}:</b> <span className="text-muted-foreground">{x.fn}</span></li>)}</ul></div>
          </div></>}
        </TabsContent>

        <TabsContent value="montagem" className="mt-4">
          {p.remote ? <RealProjectResults projectId={p.id} kind="assembly" /> : !ready && <Empty />}<ol className="space-y-3">{ready && demoSteps.map((s, i) => <li key={i} className="flex gap-4 rounded-xl border bg-card p-4 shadow-card"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-mono text-sm font-bold text-primary-foreground">{i + 1}</span><p className="pt-1.5 text-sm text-primary">{s}</p></li>)}</ol>
        </TabsContent>

        <TabsContent value="historico" className="mt-4">
          <ol className="relative ml-3 border-l pl-6">{(p.isExample ? (ready ? demoHistory : demoHistory.slice(0, 2)) : [{ date: new Date(p.createdAt).toLocaleString("pt-BR"), text: p.remote ? "Projeto registrado no Supabase" : "Projeto criado nesta sessão temporária" }]).map((h) => <li key={h.date} className="mb-5"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-card bg-electric" /><div className="font-mono text-xs text-muted-foreground">{h.date}</div><div className="text-sm text-primary">{h.text}</div></li>)}</ol>
        </TabsContent>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          {previous ? <Button variant="outline" onClick={() => {
            const available = projectStages.slice(0, index).filter((item) => canOpenStage(p, item.id));
            const target = available.at(-1);
            if (target) selectStage(target.id);
          }}><ArrowLeft />Voltar</Button> : <Button asChild variant="outline"><Link to="/app/meus-projetos"><ArrowLeft />Voltar</Link></Button>}
          <p className="text-xs text-muted-foreground">Etapa {index + 1} de {projectStages.length}</p>
          {next ? <Button variant="electric" disabled={!canOpenStage(p, next.id)} onClick={() => selectStage(next.id)}>Continuar<ArrowRight /></Button> : <Button asChild variant="electric"><Link to="/app/meus-projetos">Meus projetos<Check /></Link></Button>}
        </div>
      </Tabs>
      <DeleteProjectDialog project={p} open={deleting} onOpenChange={setDeleting} redirect />
    </div>
  );
}
