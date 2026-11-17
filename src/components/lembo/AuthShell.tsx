import type { ReactNode } from "react";
import { LogoLockup } from "./Logo";
import { Cpu, Ruler, ScanEye } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-gradient-navy p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 blueprint-grid-dark" />
        <div className="relative">
          <LogoLockup className="w-44" />
        </div>
        <div className="relative max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-sky">Engenharia · IA · Precisão</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">Da fotografia à prancha técnica 2D.</h2>
          <p className="mt-4 text-primary-foreground/75">Transforme fotografias, esboços e desenhos em pranchas mecânicas profissionais, com explicação didática para fabricar, montar e instalar.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {[[ScanEye, "Interpretação visual de objetos"], [Ruler, "Cotas com nível de confiabilidade"], [Cpu, "Orientação para fabricação e montagem"]].map(([I, t]) => {
              const Icon = I as typeof Cpu;
              return <li key={t as string} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-md bg-electric/20 text-sky"><Icon className="h-4 w-4" /></span>{t as string}</li>;
            })}
          </ul>
        </div>
        <p className="relative font-mono text-[11px] text-primary-foreground/50">LEMBO · Visual-to-Engineering</p>
      </aside>
      <main className="flex items-center justify-center bg-background px-5 py-10 blueprint-grid">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden"><LogoLockup className="w-36 shadow-card" /></div>
          <div className="rounded-xl border bg-card p-7 shadow-card">
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">A autenticação será conectada ao backend na próxima etapa.</p>
        </div>
      </main>
    </div>
  );
}
