import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/lembo/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/integration";
import { runIntegration } from "@/components/lembo/useNotConnected";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [
    { title: "Recuperar senha — LEMBO" },
    { name: "description", content: "Receba um link para redefinir sua senha na LEMBO." },
    { property: "og:title", content: "Recuperar senha — LEMBO" },
    { property: "og:description", content: "Redefina o acesso à sua conta LEMBO." },
  ] }),
  component: () => (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link de redefinição para seu e-mail.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); runIntegration(() => auth.resetPassword()); }}>
        <div className="space-y-1.5"><Label htmlFor="e">E-mail</Label><Input id="e" type="email" required /></div>
        <Button variant="electric" className="w-full" type="submit">Enviar link</Button>
      </form>
      <p className="mt-5 text-center text-sm"><Link to="/" className="font-medium text-electric hover:underline">← Voltar ao login</Link></p>
    </AuthShell>
  ),
});
