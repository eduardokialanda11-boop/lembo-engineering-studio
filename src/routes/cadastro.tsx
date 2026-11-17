import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/lembo/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/integration";
import { runIntegration } from "@/components/lembo/useNotConnected";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [
    { title: "Criar conta — LEMBO" },
    { name: "description", content: "Crie sua conta na LEMBO Visual-to-Engineering." },
    { property: "og:title", content: "Criar conta — LEMBO" },
    { property: "og:description", content: "Cadastre-se e comece a gerar pranchas técnicas 2D." },
  ] }),
  component: () => (
    <AuthShell title="Criar conta" subtitle="Comece a transformar imagens em engenharia.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); runIntegration(() => auth.signUp()); }}>
        <div className="space-y-1.5"><Label htmlFor="n">Nome</Label><Input id="n" required /></div>
        <div className="space-y-1.5"><Label htmlFor="e">E-mail</Label><Input id="e" type="email" required /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Senha</Label><Input id="p" type="password" minLength={8} required /></div>
        <Button variant="electric" className="w-full" type="submit">Criar conta</Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">Já tem conta? <Link to="/" className="font-medium text-electric hover:underline">Entrar</Link></p>
    </AuthShell>
  ),
});
