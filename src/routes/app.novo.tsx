import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { imageAccept, validateImage, validateProjectInput } from "@/lib/project-state";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/app/novo")({
  head: () => pageMeta("Novo projeto", "Adicione uma imagem de referência, descrição e medidas conhecidas ao seu projeto LEMBO."),
  component: NewProject,
});
function NewProject() {
  const nav = useNavigate();
  const { createProject, setQuery } = useProjects();
  const input = useRef<HTMLInputElement>(null);
  const locked = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [dims, setDims] = useState([{ label: "", value: "" }]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const pick = (candidate?: File) => {
    if (!candidate) return;
    try { validateImage(candidate); setError(""); setFile(candidate); setPreview(URL.createObjectURL(candidate)); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Não foi possível abrir a imagem."; setError(message); toast.error(message); }
    if (input.current) input.current.value = "";
  };
  return <form className="mx-auto max-w-5xl space-y-6" onSubmit={async (event) => {
    event.preventDefault();
    if (locked.current) return;
    let imageUrl: string | undefined;
    try {
      if (!file) throw new Error("Adicione uma imagem de referência para criar o projeto.");
      validateProjectInput(name, dims);
      locked.current = true; setBusy(true); setError("");
      imageUrl = URL.createObjectURL(file);
      const project = createProject({ name, description, notes, dimensions: dims, imageUrl, imageName: file.name });
      imageUrl = undefined;
      setQuery(""); toast.success("Projeto criado nesta sessão. Os dados são temporários.");
      await nav({ to: "/app/projetos/$id", params: { id: project.id } });
    } catch (reason) { if (imageUrl) URL.revokeObjectURL(imageUrl); const message = reason instanceof Error ? reason.message : "Não foi possível criar o projeto. Tente novamente."; setError(message); toast.error(message); }
    finally { locked.current = false; setBusy(false); }
  }}>
    <div><h1 className="text-2xl font-bold text-primary sm:text-3xl">Novo projeto</h1><p className="mt-2 text-sm text-muted-foreground">Referência visual e informações do projeto.</p></div>
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section className="min-w-0 space-y-3"><Label className="block">Imagem de referência</Label><input aria-label="Selecionar imagem de referência" ref={input} type="file" accept={imageAccept} className="hidden" onChange={(event) => pick(event.target.files?.[0])} />
        {preview ? <div className="space-y-3"><div className="grid aspect-[4/3] overflow-hidden rounded-lg border bg-paper"><img src={preview} alt="Pré-visualização da imagem de referência" onError={() => { setFile(null); setPreview(null); setError("Não foi possível ler a imagem. Selecione outro arquivo JPG, PNG, WEBP ou BMP."); }} className="h-full w-full object-contain" /></div><p className="break-all text-xs text-muted-foreground">{file?.name} · {((file?.size ?? 0) / 1024).toFixed(0)} KB</p><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => input.current?.click()}><RefreshCw />Substituir</Button><Button type="button" variant="outline" onClick={() => { setFile(null); setPreview(null); }}><Trash2 />Remover</Button></div></div>
        : <Button type="button" variant="outline" onClick={() => input.current?.click()} onDragOver={(event) => { event.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(event) => { event.preventDefault(); setDrag(false); pick(event.dataTransfer.files[0]); }} className={`h-auto min-h-72 w-full flex-col gap-3 whitespace-normal border-2 border-dashed p-6 text-center ${drag ? "border-electric bg-electric/5" : "bg-muted/40"}`}><ImagePlus className="!h-8 !w-8 text-electric" /><span>Arraste a imagem ou clique para enviar</span><span className="text-xs font-normal text-muted-foreground">JPG, PNG, WEBP ou BMP</span></Button>}
      </section>
      <section className="min-w-0 space-y-5">
        <div className="space-y-1.5"><Label htmlFor="name">Nome do projeto</Label><Input id="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Suporte de prateleira" /></div>
        <div className="space-y-1.5"><Label htmlFor="desc">Descrição</Label><Textarea id="desc" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="O que é o objeto e para que serve?" /></div>
        <div className="space-y-2"><Label>Dimensões conhecidas <span className="font-normal text-muted-foreground">(opcional, em mm)</span></Label>
          {dims.map((dimension, index) => <div key={index} className="flex min-w-0 gap-2"><Input aria-label={`Nome da medida ${index + 1}`} placeholder="Ex.: Largura" value={dimension.label} onChange={(event) => setDims(dims.map((item, other) => other === index ? { ...item, label: event.target.value } : item))} className="min-w-0" /><Input aria-label={`Valor da medida ${index + 1} em mm`} placeholder="mm" type="number" min="0.001" step="any" className="w-24 shrink-0 font-mono" value={dimension.value} onChange={(event) => setDims(dims.map((item, other) => other === index ? { ...item, value: event.target.value } : item))} /><Button type="button" size="icon" variant="ghost" title="Remover medida" aria-label={`Remover medida ${index + 1}`} className="shrink-0" onClick={() => setDims(dims.filter((_, other) => other !== index))}><Trash2 /></Button></div>)}
          <Button type="button" variant="ghost" size="sm" onClick={() => setDims([...dims, { label: "", value: "" }])}><Plus />Adicionar medida</Button>
        </div>
        <div className="space-y-1.5"><Label htmlFor="notes">Observações adicionais</Label><Textarea id="notes" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Detalhes ou pontos que precisam de atenção." /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" variant="electric" size="lg" disabled={busy} className="w-full">{busy ? <Loader2 className="animate-spin" /> : <Plus />}{busy ? "Criando…" : "Criar projeto"}</Button>
      </section>
    </div>
  </form>;
}
