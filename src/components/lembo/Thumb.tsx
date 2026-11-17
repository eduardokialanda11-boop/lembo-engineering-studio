import type { DemoProject } from "@/lib/demo-data";
/** Miniatura ilustrativa (exemplo) da imagem original. */
export function Thumb({ kind }: { kind: DemoProject["thumb"] }) {
  return (
    <svg viewBox="0 0 100 70" className="h-full w-full bg-paper blueprint-grid stroke-ink" fill="none" strokeWidth={1.5}>
      {kind === "bracket" && <path d="M25 55 H75 V50 H35 V15 H25 Z M35 50 L55 30" />}
      {kind === "flange" && (<><circle cx="50" cy="35" r="24" /><circle cx="50" cy="35" r="9" />{[0, 90, 180, 270].map((a) => <circle key={a} cx={50 + 17 * Math.cos((a * Math.PI) / 180)} cy={35 + 17 * Math.sin((a * Math.PI) / 180)} r="2.5" />)}</>)}
      {kind === "shaft" && <path d="M10 30 H30 V25 H70 V30 H90 V40 H70 V45 H30 V40 H10 Z" />}
      {kind === "frame" && <path d="M15 10 H85 V60 H15 Z M15 10 L85 60 M30 10 V60 M50 10 V60 M70 10 V60" />}
    </svg>
  );
}
