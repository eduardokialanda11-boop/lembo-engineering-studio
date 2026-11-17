/** DADOS DEMONSTRATIVOS — apenas para composição visual. Não são resultados reais de IA. */
export type ProjectStatus = "rascunho" | "em_analise" | "concluido" | "erro";
export type DimKind = "observed" | "calculated" | "estimated" | "unknown";

export interface DemoProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
  thumb: "bracket" | "flange" | "shaft" | "frame";
}

export const statusLabel: Record<ProjectStatus, string> = {
  rascunho: "Rascunho",
  em_analise: "Em análise",
  concluido: "Concluído",
  erro: "Requer atenção",
};

export const demoProjects: DemoProject[] = [
  { id: "exemplo-suporte", name: "Suporte em L soldado", description: "Esboço à mão de um suporte de parede.", status: "concluido", createdAt: "2026-11-12", thumb: "bracket" },
  { id: "exemplo-flange", name: "Flange de acoplamento", description: "Fotografia de peça usinada.", status: "em_analise", createdAt: "2026-11-15", thumb: "flange" },
  { id: "exemplo-eixo", name: "Eixo de transmissão", description: "Desenho técnico antigo digitalizado.", status: "concluido", createdAt: "2026-11-08", thumb: "shaft" },
  { id: "exemplo-quadro", name: "Quadro de portão", description: "Fotografia em obra para serralheria.", status: "rascunho", createdAt: "2026-11-16", thumb: "frame" },
];

export const dimKindMeta: Record<DimKind, { label: string; short: string; desc: string }> = {
  observed: { label: "Observada", short: "OBS", desc: "Lida diretamente na imagem ou informada pelo usuário." },
  calculated: { label: "Calculada", short: "CALC", desc: "Derivada matematicamente de outras medidas conhecidas." },
  estimated: { label: "Estimada", short: "EST", desc: "Aproximação por proporção. Não é medida exata — confirmar antes de fabricar." },
  unknown: { label: "Desconhecida", short: "?", desc: "Não pôde ser determinada. Necessita confirmação do usuário." },
};

export interface DemoPart { id: string; code: string; name: string; fn: string; }
export const demoParts: DemoPart[] = [
  { id: "p1", code: "P1", name: "Chapa de base", fn: "Fixa o suporte na parede através de parafusos." },
  { id: "p2", code: "P2", name: "Chapa vertical", fn: "Recebe a carga e transmite para a base." },
  { id: "p3", code: "P3", name: "Nervura (reforço)", fn: "Impede que o ângulo de 90° se deforme sob carga." },
  { id: "p4", code: "P4", name: "Furos de fixação", fn: "Passagem dos parafusos de ancoragem." },
];

export interface DemoDim { id: string; label: string; value: string; kind: DimKind; part: string; }
export const demoDims: DemoDim[] = [
  { id: "d1", label: "Largura da base", value: "120", kind: "observed", part: "p1" },
  { id: "d2", label: "Altura total", value: "≈ 150", kind: "estimated", part: "p2" },
  { id: "d3", label: "Profundidade", value: "80", kind: "observed", part: "p1" },
  { id: "d4", label: "Distância entre furos", value: "80", kind: "calculated", part: "p4" },
  { id: "d5", label: "Espessura da chapa", value: "?", kind: "unknown", part: "p1" },
  { id: "d6", label: "Diâmetro dos furos", value: "?", kind: "unknown", part: "p4" },
];

export const demoSteps = [
  "Posicionar a chapa vertical (P2) sobre a chapa de base (P1) formando 90°.",
  "Ponteia a solda nas extremidades e conferir o esquadro.",
  "Soldar a nervura (P3) no centro, unindo P1 e P2.",
  "Furar a base (P4) conforme cotas confirmadas pelo usuário.",
];

export const demoHistory = [
  { date: "2026-11-12 09:14", text: "Projeto criado" },
  { date: "2026-11-12 09:15", text: "Imagem enviada" },
  { date: "2026-11-12 09:17", text: "Análise concluída" },
  { date: "2026-11-12 09:20", text: "2 dimensões aguardando confirmação" },
];
