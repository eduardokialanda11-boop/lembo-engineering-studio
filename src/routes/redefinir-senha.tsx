import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthShell } from "@/components/lembo/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/integration";
import { runIntegration } from "@/components/lembo/useNotConnected";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({ meta: [
    { title: "Nova senha — LEMBO" },
    { name: "description", content: "Defina uma nova senha para sua conta LEMBO." },
    { property: "og:title", content: "Nova senha — LEMBO" },
    { property: "og:description", content: "Defina uma nova senha na LEMBO Visual-to-Engineering." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  return (
    <AuthShell title="Definir nova senha" subtitle="Escolha uma senha com pelo menos 8 caracteres.">
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); if (await runIntegration(() => auth.updatePassword(String(f.get("p"))))) { toast.success("Senha atualizada."); navigate({ to: "/app" }); } }}>
        <div className="space-y-1.5"><Label htmlFor="p">Nova senha</Label><Input id="p" name="p" type="password" minLength={8} required /></div>
        <Button variant="electric" className="w-full" type="submit">Salvar senha</Button>
      </form>
    </AuthShell>
  );
}
