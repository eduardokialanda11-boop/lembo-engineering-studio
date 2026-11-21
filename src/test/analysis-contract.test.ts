import { describe, expect, it } from "vitest";
import { analysisSchema, dimensionSchema, parseSavedAnalysis, validateSvgPath, formatEngineeringDimension } from "@/lib/analysis-contract";
import { projectFromRow } from "@/lib/project-state";
import { canOpenStage, analysisState } from "@/lib/project-workflow";
import { analysisFixture } from "./analysis-fixture";
describe("Contrato persistido de engenharia", () => {
  it("valida comandos SVG completos e rejeita argumentos ausentes", () => {
    expect(validateSvgPath("M0 0 L100 100 Z")).toBe(true);
    expect(validateSvgPath("M0")).toBe(false);
    expect(validateSvgPath("M0 0 L")).toBe(false);
    expect(validateSvgPath("M0 0 A10 10 0 2 0 20 20")).toBe(false);
  });
  it("aceita medida fornecida e aplica a mesma validação às cotas", () => {
    const dimension = { name: "Altura", value: 120, unit: "mm", source: "provided", note: "" };
    expect(dimensionSchema.safeParse(dimension).success).toBe(true);
    expect(analysisSchema.safeParse(analysisFixture).success).toBe(true);
    const withDimension = (value: unknown) => ({ ...analysisFixture, technical_drawing: {
      ...analysisFixture.technical_drawing, views: analysisFixture.technical_drawing.views.map((view, index) =>
        index === 0 ? { ...view, dimensions: [value] } : view),
    } });
    const placed = { ...dimension, x1: 10, y1: 10, x2: 100, y2: 10 };
    expect(analysisSchema.safeParse(withDimension(placed)).success).toBe(true);
    expect(analysisSchema.safeParse(withDimension({ ...placed, source: "unknown" })).success).toBe(false);
    expect(analysisSchema.safeParse(withDimension({ ...placed, value: null })).success).toBe(false);
  });
  it("recupera vistas antigas sem inventar geometria", () => {
    const first = analysisFixture.technical_drawing.views[0];
    if (!first) throw new Error("Missing fixture view");
    const { kind: _kind, ...legacyView } = first;
    const restored = parseSavedAnalysis({ ...analysisFixture, technical_drawing: {
      ...analysisFixture.technical_drawing, views: [legacyView],
    } });
    expect(restored?.technical_drawing.views.map((view) => view.kind)).toEqual(["front", "top", "side", "isometric", "exploded"]);
    expect(restored?.technical_drawing.views.slice(1).every((view) => view.status === "requested" && view.paths.length === 0)).toBe(true);
  });
  it("recupera análise de parts_data e libera desenho após recarga", () => {
    const project = projectFromRow({ id: "saved", title: "Salvo", image_url: "", status: "needs_more_information", created_at: null, reference_measure: "Nome informado: Salvo", parts_data: { ...analysisFixture, analysis_status: "needs_more_information" } });
    expect(project.analysis?.title).toBe("Peça analisada"); expect(project.description).toBe("Resumo recebido"); expect(project.status).toBe("rascunho"); expect(analysisState(project)).toBe("completed"); expect(canOpenStage(project, "prancha")).toBe(true); expect(project.dimensions).toEqual([]);
  });
  it("rejeita coordenadas fora de 0 a 1000", () => {
    expect(analysisSchema.safeParse({ ...analysisFixture, technical_drawing: { ...analysisFixture.technical_drawing, views: analysisFixture.technical_drawing.views.map((item, index) => index === 0 ? { ...item, circles: [{ cx: 1001, cy: 20, r: 10, stroke: "#222", fill: "none", stroke_width: 2 }] } : item) } }).success).toBe(false);
  });
  it("não apresenta dimensão desconhecida como valor exato", () => {
    expect(formatEngineeringDimension({ name: "Largura", value: 120, source: "unknown", unit: "mm", note: "" })).toBe("Largura: A DEFINIR");
  });
  it("marca dimensão estimada como aproximação", () => {
    expect(formatEngineeringDimension({ name: "Largura", value: 120, source: "estimated", unit: "mm", note: "" })).toBe("Largura: ≈ 120 mm");
  });
});