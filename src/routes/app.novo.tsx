import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, Loader2, ScanEye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { imageAccept, validateImage } from "@/lib/project-state";
import { pageMeta } from "@/lib/page-meta";
import { analysisApi, buildAnalysisReference, resolveProjectImage } from "@/lib/integration";

export const Route = createFileRoute("/app/novo")({
  head: () => pageMeta("Novo projeto", "Envie uma imagem e o LEMBO gera a documentação técnica 2D e o guia visual de montagem."),
  component: NewProject,
});
export function NewProject() {
  const nav = useNavigate();
  const { acceptAnalysis, setQuery } = useProjects();
  const input = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [savedId, setSavedId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const pick = (candidate?: File) => {
    if (!candidate) return;
    try { validateImage(candidate); setError(""); setFile(candidate); setPreview(URL.createObjectURL(candidate)); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Não foi possível abrir a imagem."; setError(message); toast.error(message); }
    if (input.current) input.current.value = "";
  };
  return <form aria-busy={busy} className="mx-auto max-w-5xl space-y-6" onSubmit={async (event) => {
    event.preventDefault();
    if (locked.current || savedId) return;
    try {
      if (!file) throw new Error("Adicione uma imagem de referência para criar o projeto.");
      locked.current = true; setBusy(true); setError("");
      const input = { image: file, name: name.trim(), description, dimensions: [], notes };
      const reference = buildAnalysisReference(input);
      const result = await analysisApi.start(input);
      setSavedId(result.project_id);
      let imageUrl = "";
      try { imageUrl = await resolveProjectImage(result.image_path); }
      catch { toast.warning("Análise salva, mas a imagem original não pôde ser aberta. O resultado técnico continua disponível."); }
      acceptAnalysis(result.project_id, { id: result.project_id, name: result.analysis.title, description: result.analysis.object_summary, analysis: result.analysis, referenceMeasure: reference, createdAt: new Date().toISOString(), status: "rascunho", remote: true, isExample: false, ...(imageUrl ? { imageUrl } : {}), dimensions: [], notes: "" });
      setQuery("");
      await nav({ to: "/app/projetos/$id", params: { id: result.project_id } });
    } catch (reason) { const message = reason instanceof Error ? reason.message : "Não foi possível concluir a solicitação. Confira Meus projetos antes de tentar novamente."; setError(message); toast.error(message); }
    finally { locked.current = false; setBusy(false); }
  }}>
    <div><h1 className="text-2xl font-bold text-primary sm:text-3xl">Novo projeto</h1><p className="mt-2 text-sm text-muted-foreground">Envie apenas uma imagem para gerar a documentação técnica 2D (cinco vistas) e o guia visual de montagem. As cotas aparecem depois, no desenho técnico, com a origem de cada medida.</p></div>
    <fieldset disabled={busy || Boolean(savedId)} className="grid min-w-0 gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="min-w-0 space-y-3"><Label className="block">Imagem de referência</Label><input aria-label="Selecionar imagem de referência" ref={input} type="file" accept={imageAccept} className="hidden" onChange={(event) => pick(event.target.files?.[0])} />
        {preview ? <div className="space-y-3"><div className="grid aspect-[4/3] overflow-hidden rounded-lg border bg-paper"><img src={preview} alt="Pré-visualização da imagem de referência" onError={() => { setFile(null); setPreview(null); setError("Não foi possível ler a imagem. Selecione outro arquivo JPG, PNG, WEBP ou BMP."); }} className="h-full w-full object-contain" /></div><p className="break-all text-xs text-muted-foreground">{file?.name} · {((file?.size ?? 0) / 1024).toFixed(0)} KB</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => input.current?.click()}><RefreshCw />Substituir</Button><Button type="button" variant="outline" onClick={() => { setFile(null); setPreview(null); }}><Trash2 />Remover</Button></div></div>
        : <Button type="button" variant="outline" onClick={() => input.current?.click()} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); pick(event.dataTransfer.files[0]); }} className={`h-auto min-h-72 w-full flex-col gap-3 whitespace-normal border-2 border-dashed p-6 text-center ${drag ? "border-electric bg-electric/5" : "bg-muted/40"}`}><ImagePlus className="!h-8 !w-8 text-electric" /><span>Arraste a imagem ou clique para enviar</span><span className="text-xs font-normal text-muted-foreground">JPG, PNG, WEBP ou BMP</span></Button>}
      </section>
      <section className="min-w-0 space-y-5">
        <div className="space-y-1.5"><Label htmlFor="name">Nome do projeto <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Se vazio, o título é gerado automaticamente" /></div>
        <div className="space-y-1.5"><Label htmlFor="desc">Descrição <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="desc" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="O que é o objeto e para que serve?" /></div>
        <div className="space-y-1.5"><Label htmlFor="notes">Observações adicionais <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Detalhes ou pontos que precisam de atenção." /></div>
        <Button type="submit" variant="electric" size="lg" disabled={busy || Boolean(savedId)} className="h-auto min-h-11 w-full whitespace-normal py-3">{busy ? <Loader2 className="shrink-0 animate-spin motion-reduce:animate-none" /> : <ScanEye className="shrink-0" />}{busy ? "Analisando e gerando projeto técnico…" : savedId ? "Análise salva" : "Analisar e gerar projeto técnico"}</Button>
        {busy && <p role="status" className="text-sm text-muted-foreground">Análise em andamento. Aguardando confirmação do salvamento.</p>}
      </section>
    </fieldset>
    {error && <p role="alert" className="break-words text-sm text-destructive">{error}</p>}
    {savedId && <Button type="button" variant="outline" onClick={() => { void nav({ to: "/app/projetos/$id", params: { id: savedId } }).catch(() => setError("A análise já foi salva. Abra o resultado em Meus projetos; não envie outra análise.")); }}><ArrowRight />Abrir resultado salvo</Button>}
  </form>;
}
