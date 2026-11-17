import { FlaskConical } from "lucide-react";
export function DemoBadge({ text = "Dados de exemplo" }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-dim-estimated/40 bg-dim-estimated/10 px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-dim-estimated">
      <FlaskConical className="h-3 w-3" /> {text}
    </span>
  );
}
