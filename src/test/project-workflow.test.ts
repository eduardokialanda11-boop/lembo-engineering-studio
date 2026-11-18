import { describe, expect, it } from "vitest";
import type { LocalProject } from "@/lib/project-state";
import { analysisState, canOpenStage, projectStages, validateAnalysisStart } from "@/lib/project-workflow";

const project: LocalProject = { id: "real-project", name: "Peça", description: "", createdAt: "2026-11-18", status: "rascunho", isExample: false, imageUrl: "blob:original", dimensions: [], notes: "" };

describe("Regras de navegação e análise do projeto", () => {
  it("mantém a sequência das sete etapas solicitadas", () => {
    expect(projectStages.map((stage) => stage.id)).toEqual(["geral", "analise", "prancha", "pecas", "didatica", "montagem", "historico"]);
  });
  it("exige imagem antes de iniciar a análise", () => {
    const { imageUrl: _imageUrl, ...withoutImage } = project;
    expect(() => validateAnalysisStart(withoutImage)).toThrow("Adicione uma imagem original");
    expect(() => validateAnalysisStart(project)).not.toThrow();
  });
  it("impede iniciar novamente um projeto já em processamento", () => {
    expect(() => validateAnalysisStart({ ...project, remote: true, status: "em_analise" })).toThrow("já está em andamento");
  });
  it("um status concluído sem resultado real não libera os resultados", () => {
    const completed = { ...project, remote: true, status: "concluido" as const };
    expect(analysisState(completed)).toBe("waiting");
    for (const stage of ["prancha", "pecas", "didatica", "montagem"]) expect(canOpenStage(completed, stage)).toBe(false);
    expect(canOpenStage(completed, "analise")).toBe(true);
    expect(canOpenStage(completed, "historico")).toBe(true);
  });
  it("não trata exemplo como análise real e só libera o exemplo com resultados", () => {
    const example = { ...project, isExample: true, id: "exemplo-suporte" };
    expect(analysisState(example)).toBe("example");
    expect(canOpenStage(example, "prancha")).toBe(true);
    expect(canOpenStage({ ...example, id: "exemplo-eixo" }, "prancha")).toBe(false);
    expect(() => validateAnalysisStart(example)).toThrow("projeto de exemplo");
  });
  it("reconhece o erro informado no projeto sem liberar resultados", () => {
    const failed = { ...project, remote: true, status: "erro" as const };
    expect(analysisState(failed)).toBe("error");
    expect(canOpenStage(failed, "prancha")).toBe(false);
  });
});