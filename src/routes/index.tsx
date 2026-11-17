import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/lembo/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/integration";
import { runIntegration } from "@/components/lembo/useNotConnected";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — LEMBO Visual-to-Engineering" },
      { name: "description", content: "Acesse a LEMBO e transforme imagens em pranchas técnicas mecânicas 2D." },
      { property: "og:title", content: "Entrar — LEMBO" },
      { property: "og:description", content: "Plataforma de engenharia assistida por IA: da imagem à prancha técnica 2D." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  return (
    <AuthShell title="Entrar na plataforma" subtitle="Acesse seus projetos de engenharia.">
      <form className="space-y-4" onSubmit={async (e) => { e.preventDefault(); setBusy(true); const done = await runIntegration(() => auth.signIn(email, pw)); setBusy(false); if (done) navigate({ to: "/app" }); }}>
        <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" /></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><Label htmlFor="pw">Senha</Label><Link to="/recuperar-senha" className="text-xs font-medium text-electric hover:underline">Esqueceu a senha?</Link></div>
          <Input id="pw" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <Button variant="electric" className="w-full" type="submit" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</Button>
      </form>
      <div className="mt-5 space-y-2 text-center text-sm text-muted-foreground">
        <p>Não tem conta? <Link to="/cadastro" className="font-medium text-electric hover:underline">Criar cadastro</Link></p>
      </div>
    </AuthShell>
  );
}
