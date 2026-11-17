import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useProjects } from "./ProjectsProvider";
import type { LocalProject } from "@/lib/project-state";

export function DeleteProjectDialog({ project, open, onOpenChange, redirect = false }: { project: LocalProject; open: boolean; onOpenChange: (value: boolean) => void; redirect?: boolean }) {
  const { deleteProject } = useProjects();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const confirm = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      // Allow the disabled state to paint before changing the shared session.
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      deleteProject(project.id);
      onOpenChange(false);
      toast.success("Projeto eliminado desta sessão.");
      if (redirect) await navigate({ to: "/app" });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Não foi possível eliminar o projeto. Tente novamente.";
      setError(message); toast.error(message);
    } finally { lock.current = false; setBusy(false); }
  };
  return <AlertDialog open={open} onOpenChange={(value) => { if (!lock.current) { setError(""); onOpenChange(value); } }}>
    <AlertDialogContent className="w-[calc(100%-2rem)] rounded-lg">
      <AlertDialogHeader>
        <span className="mb-1 flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive"><Trash2 /></span>
        <AlertDialogTitle>Eliminar projeto?</AlertDialogTitle>
        <AlertDialogDescription>Tem certeza de que deseja eliminar este projeto? Esta ação não poderá ser desfeita.</AlertDialogDescription>
      </AlertDialogHeader>
      <p className="break-words text-sm font-semibold text-primary">{project.name}</p>
      <p className="text-xs text-muted-foreground">Apenas o estado temporário desta sessão será alterado. Nenhum dado será eliminado do banco de dados.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <AlertDialogFooter className="gap-2"><AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel><Button variant="destructive" disabled={busy} onClick={confirm}>{busy ? <Loader2 className="animate-spin" /> : <Trash2 />}{busy ? "Eliminando…" : "Eliminar projeto"}</Button></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}