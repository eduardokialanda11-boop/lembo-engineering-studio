import { createFileRoute, Link } from "@tanstack/react-router";
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
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <AuthShell title="Entrar na plataforma" subtitle="Acesse seus projetos de engenharia.">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); runIntegration(() => auth.signIn()); }}>
        <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" type="email" required placeholder="voce@empresa.com" /></div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between"><Label htmlFor="pw">Senha</Label><Link to="/recuperar-senha" className="text-xs font-medium text-electric hover:underline">Esqueceu a senha?</Link></div>
          <Input id="pw" type="password" required />
        </div>
        <Button variant="electric" className="w-full" type="submit">Entrar</Button>
      </form>
      <div className="mt-5 space-y-2 text-center text-sm text-muted-foreground">
        <p>Não tem conta? <Link to="/cadastro" className="font-medium text-electric hover:underline">Criar cadastro</Link></p>
        <p><Link to="/app" className="text-xs underline-offset-4 hover:underline">Ver interface de demonstração →</Link></p>
      </div>
    </AuthShell>
  );
}
