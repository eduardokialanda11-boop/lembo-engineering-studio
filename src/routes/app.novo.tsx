import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, ScanSearch, Camera, PenLine, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/app/novo")({
  head: () => ({ meta: [
    { title: "Novo projeto — LEMBO" },
    { name: "description", content: "Envie uma imagem e inicie a análise técnica na LEMBO." },
    { property: "og:title", content: "Novo projeto — LEMBO" },
    { property: "og:description", content: "Fotografias, esboços e desenhos técnicos viram pranchas 2D." },
  ] }),
  component: NewProject,
});

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/bmp,image/tiff";

function NewProject() {
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [dims, setDims] = useState([{ label: "", value: "" }]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const pick = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Envie um arquivo de imagem (JPG, PNG, WEBP...)."); return; }
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  return (
    <form className="mx-auto max-w-5xl space-y-6" onSubmit={(e) => {
      e.preventDefault();
      if (!file) { toast.error("Adicione uma imagem para analisar."); return; }
      nav({ to: "/app/analise" });
    }}>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-electric">Etapa 1 de 3</p>
        <h1 className="mt-1 text-2xl font-bold text-primary sm:text-3xl">Novo projeto</h1>
        <p className="mt-1 text-sm text-muted-foreground">Não precisa saber desenho técnico: envie a imagem e informe o que já sabe.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <Label className="mb-3 block">Imagem do objeto</Label>
          <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          {preview ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border bg-paper blueprint-grid"><img src={preview} alt="Pré-visualização" className="mx-auto max-h-80 object-contain" /></div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-mono text-xs text-muted-foreground">{file?.name} · {((file?.size ?? 0) / 1024).toFixed(0)} KB</span>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()}><RefreshCw /> Substituir</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => { setFile(null); setPreview(null); }}><Trash2 /> Remover</Button>
                </div>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => input.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
              className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-14 text-center transition ${drag ? "border-electric bg-electric/5" : "border-border bg-muted/40 hover:border-electric/60"}`}>
              <span className="grid h-14 w-14 place-items-center rounded-full bg-electric/10 text-electric"><ImagePlus className="h-6 w-6" /></span>
              <span className="mt-4 font-semibold text-primary">Arraste a imagem ou clique para enviar</span>
              <span className="mt-1 text-xs text-muted-foreground">JPG, PNG, WEBP, HEIC, BMP ou TIFF</span>
            </button>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
            {[[Camera, "Fotografias"], [PenLine, "Esboços à mão"], [FileImage, "Desenhos técnicos"]].map(([I, t]) => { const Icon = I as typeof Camera; return <div key={t as string} className="rounded-md bg-muted/60 p-2"><Icon className="mx-auto mb-1 h-4 w-4 text-primary" />{t as string}</div>; })}
          </div>
        </div>

        <div className="space-y-5 rounded-xl border bg-card p-5 shadow-card">
          <div className="space-y-1.5"><Label htmlFor="name">Nome do projeto</Label><Input id="name" required placeholder="Ex.: Suporte de prateleira" /></div>
          <div className="space-y-1.5"><Label htmlFor="desc">Descrição</Label><Textarea id="desc" rows={3} placeholder="O que é o objeto e para que serve?" /></div>
          <div className="space-y-2">
            <Label>Dimensões conhecidas <span className="font-normal text-muted-foreground">(opcional, em mm)</span></Label>
            <p className="text-xs text-muted-foreground">Medidas reais aumentam a precisão. Sem elas, as cotas aparecerão como estimadas ou desconhecidas.</p>
            {dims.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input placeholder="Ex.: Largura" value={d.label} onChange={(e) => setDims(dims.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                <Input placeholder="mm" type="number" min={0} className="w-24 font-mono" value={d.value} onChange={(e) => setDims(dims.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} />
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => setDims([...dims, { label: "", value: "" }])}>+ Adicionar medida</Button>
          </div>
          <Button type="submit" variant="electric" size="lg" className="w-full"><ScanSearch /> Analisar projeto</Button>
        </div>
      </div>
    </form>
  );
}
