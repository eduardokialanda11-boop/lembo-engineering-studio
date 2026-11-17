import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Signup,
});

function Signup() {
  const [sent, setSent] = useState(false);
  return (
    <AuthShell title="Criar conta" subtitle="Comece a transformar imagens em engenharia.">
      {sent ? <p role="status" className="rounded-md border bg-secondary/50 p-4 text-sm">Conta criada. Confirme o cadastro pelo link enviado ao seu e-mail e depois entre.</p> : <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); const f = new FormData(e.currentTarget); if (await runIntegration(() => auth.signUp(String(f.get("n")), String(f.get("e")), String(f.get("p"))))) setSent(true); }}>
        <div className="space-y-1.5"><Label htmlFor="n">Nome</Label><Input id="n" name="n" required /></div>
        <div className="space-y-1.5"><Label htmlFor="e">E-mail</Label><Input id="e" name="e" type="email" required /></div>
        <div className="space-y-1.5"><Label htmlFor="p">Senha</Label><Input id="p" name="p" type="password" minLength={8} required /></div>
        <Button variant="electric" className="w-full" type="submit">Criar conta</Button>
      </form>}
      <p className="mt-5 text-center text-sm text-muted-foreground">Já tem conta? <Link to="/" className="font-medium text-electric hover:underline">Entrar</Link></p>
    </AuthShell>
  );
}
