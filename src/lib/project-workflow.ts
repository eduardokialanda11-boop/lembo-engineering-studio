import type { LocalProject } from "./project-state";

export const projectStages = [
  { id: "geral", label: "Imagem e informações" },
  { id: "analise", label: "Análise de engenharia" },
  { id: "prancha", label: "Prancha técnica 2D" },
  { id: "pecas", label: "Peças" },
  { id: "didatica", label: "Entenda o desenho" },
  { id: "montagem", label: "Montagem" },
  { id: "historico", label: "Histórico" },
] as const;

export type ProjectStage = typeof projectStages[number]["id"];
export type AnalysisState = "waiting" | "processing" | "completed" | "error" | "example";

export function hasExampleResults(project: LocalProject) {
  return project.isExample && project.id === "exemplo-suporte";
}

export function analysisState(project: LocalProject): AnalysisState {
  if (hasExampleResults(project)) return "example";
  if (project.isExample) return "waiting";
  if (project.status === "erro") return "error";
  if (project.remote && project.status === "em_analise") return "processing";
  // A status string alone is not proof of a technical result. No real result
  // contract is available yet; never unlock the example drawing for real rows.
  return "waiting";
}

export function canOpenStage(project: LocalProject, stage: string): stage is ProjectStage {
  if (!projectStages.some((item) => item.id === stage)) return false;
  return stage === "geral" || stage === "analise" || stage === "historico" || hasExampleResults(project) || (Boolean(project.remote) && ["pecas", "didatica", "montagem"].includes(stage));
}

export function stageState(project: LocalProject, stage: ProjectStage) {
  if (stage === "geral") return project.imageUrl || project.thumb ? "Concluída" : "Pendente";
  if (stage === "historico") return "Disponível";
  if (hasExampleResults(project)) return "Exemplo disponível";
  if (stage === "analise" && analysisState(project) === "processing") return "Em andamento";
  if (stage === "analise" && analysisState(project) === "error") return "Requer atenção";
  return "Pendente";
}

export function validateAnalysisStart(project: LocalProject) {
  if (!project.imageUrl) throw new Error("Adicione uma imagem original antes de iniciar a análise.");
  if (project.isExample) throw new Error("Este é um projeto de exemplo. Crie um projeto com sua imagem para iniciar uma análise.");
  if (analysisState(project) === "processing") throw new Error("A análise deste projeto já está em andamento.");
}