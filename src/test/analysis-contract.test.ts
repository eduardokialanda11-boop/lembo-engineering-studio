import { describe, expect, it } from "vitest";
import { analysisSchema, formatEngineeringDimension } from "@/lib/analysis-contract";
import { projectFromRow } from "@/lib/project-state";
import { canOpenStage, analysisState } from "@/lib/project-workflow";
import { analysisFixture } from "./analysis-fixture";
describe("Contrato persistido de engenharia", () => {
  it("recupera análise de parts_data e libera desenho após recarga", () => {
    const project = projectFromRow({ id: "saved", title: "Salvo", image_url: "", status: "needs_more_information", created_at: null, reference_measure: "Nome informado: Salvo", parts_data: { ...analysisFixture, analysis_status: "needs_more_information" } });
    expect(project.analysis?.title).toBe("Peça analisada"); expect(project.description).toBe("Resumo recebido"); expect(project.status).toBe("rascunho"); expect(analysisState(project)).toBe("completed"); expect(canOpenStage(project, "prancha")).toBe(true); expect(project.dimensions).toEqual([]);
  });
  it("rejeita coordenadas fora de 0 a 1000", () => {
    const view = analysisFixture.technical_drawing.views[0];
    expect(analysisSchema.safeParse({ ...analysisFixture, technical_drawing: { ...analysisFixture.technical_drawing, views: [{ ...view, circles: [{ cx: 1001, cy: 20, r: 10, stroke: "", fill: "", stroke_width: 2 }] }] } }).success).toBe(false);
  });
  it("não apresenta dimensão desconhecida como valor exato", () => {
    expect(formatEngineeringDimension({ name: "Largura", value: 120, source: "unknown", unit: "mm", note: "" })).toBe("Largura: A DEFINIR");
  });
  it("marca dimensão estimada como aproximação", () => {
    expect(formatEngineeringDimension({ name: "Largura", value: 120, source: "estimated", unit: "mm", note: "" })).toBe("Largura: ≈ 120 mm");
  });
});