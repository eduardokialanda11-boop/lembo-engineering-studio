import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NewProject } from "@/routes/app.novo";
import { responseFixture } from "./analysis-fixture";

const mocks = vi.hoisted(() => ({ start: vi.fn(), resolveImage: vi.fn(), accept: vi.fn(), create: vi.fn(), navigate: vi.fn(), setQuery: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => options, useNavigate: () => mocks.navigate }));
vi.mock("@/components/lembo/ProjectsProvider", () => ({ useProjects: () => ({ acceptAnalysis: mocks.accept, createProject: mocks.create, setQuery: mocks.setQuery }) }));
vi.mock("@/lib/integration", async (original) => ({ ...await original<typeof import("@/lib/integration")>(), analysisApi: { start: mocks.start }, resolveProjectImage: mocks.resolveImage }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: vi.fn(() => "blob:preview"), revokeObjectURL: vi.fn() }));
  mocks.start.mockResolvedValue(responseFixture);
  mocks.resolveImage.mockResolvedValue("https://example.com/signed.png");
  mocks.navigate.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function fillForm() {
  render(<NewProject />);
  const image = new File(["original"], "original.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText("Selecionar imagem de referência"), { target: { files: [image] } });
  fireEvent.change(screen.getByLabelText("Nome do projeto"), { target: { value: "Suporte" } });
  fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Suporte de parede" } });
  fireEvent.change(screen.getByLabelText("Nome da medida 1"), { target: { value: "Largura" } });
  fireEvent.change(screen.getByLabelText("Valor da medida 1 em mm"), { target: { value: "120" } });
  fireEvent.change(screen.getByLabelText("Referência de medida (opcional)"), { target: { value: "Altura total 80 mm" } });
  fireEvent.change(screen.getByLabelText("Observações adicionais"), { target: { value: "Confirmar furos" } });
  return image;
}

describe("Novo projeto: análise direta", () => {
  it("envia todos os dados originais e abre somente o ID confirmado, sem criar rascunho", async () => {
    const image = fillForm();
    fireEvent.submit(screen.getByRole("button", { name: "Analisar e gerar projeto técnico" }).closest("form") as HTMLFormElement);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith({ to: "/app/projetos/$id", params: { id: responseFixture.project_id } }));
    expect(mocks.start).toHaveBeenCalledExactlyOnceWith({ image, name: "Suporte", description: "Suporte de parede", dimensions: [{ label: "Largura", value: "120" }], referenceMeasure: "Altura total 80 mm", notes: "Confirmar furos" });
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.accept).toHaveBeenCalledWith(responseFixture.project_id, expect.objectContaining({ analysis: responseFixture.analysis, remote: true, referenceMeasure: "Nome informado: Suporte\nDescrição: Suporte de parede\nMedida informada: Largura = 120 mm\nReferência: Altura total 80 mm\nObservações: Confirmar furos" }));
  });
  it("bloqueia envios duplicados e não exibe resultado antes da confirmação", async () => {
    let finish: ((value: typeof responseFixture) => void) | undefined;
    mocks.start.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    fillForm();
    const form = screen.getByRole("button", { name: "Analisar e gerar projeto técnico" }).closest("form") as HTMLFormElement;
    fireEvent.submit(form); fireEvent.submit(form);
    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(mocks.accept).not.toHaveBeenCalled(); expect(mocks.navigate).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome do projeto")).toBeDisabled();
    finish?.(responseFixture);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledTimes(1));
  });
  it("preserva os dados após erro e só tenta novamente mediante envio manual", async () => {
    mocks.start.mockRejectedValueOnce(new Error("Falha na análise. Confira Meus projetos antes de repetir."));
    fillForm(); const button = screen.getByRole("button", { name: "Analisar e gerar projeto técnico" });
    fireEvent.click(button);
    await screen.findByRole("alert");
    expect(mocks.start).toHaveBeenCalledTimes(1); expect(mocks.accept).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome do projeto")).toHaveValue("Suporte");
    fireEvent.click(button);
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledTimes(1));
    expect(mocks.start).toHaveBeenCalledTimes(2);
  });
  it("não reenvia análise confirmada se a navegação falhar", async () => {
    mocks.navigate.mockRejectedValueOnce(new Error("Falha de navegação"));
    fillForm(); fireEvent.click(screen.getByRole("button", { name: "Analisar e gerar projeto técnico" }));
    await screen.findByRole("alert");
    fireEvent.click(screen.getByRole("button", { name: "Abrir resultado salvo" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledTimes(2));
    expect(mocks.start).toHaveBeenCalledTimes(1);
  });
  it("abre o resultado confirmado mesmo quando a imagem assinada falha", async () => {
    mocks.resolveImage.mockRejectedValue(new Error("Storage indisponível"));
    fillForm(); fireEvent.click(screen.getByRole("button", { name: "Analisar e gerar projeto técnico" }));
    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledTimes(1));
    expect(mocks.accept).toHaveBeenCalledWith(responseFixture.project_id, expect.objectContaining({ analysis: responseFixture.analysis }));
    expect(mocks.start).toHaveBeenCalledTimes(1);
  });
  it("bloqueia medidas incompletas antes da chamada", async () => {
    fillForm(); fireEvent.change(screen.getByLabelText("Valor da medida 1 em mm"), { target: { value: "" } });
    fireEvent.submit(screen.getByRole("button", { name: "Analisar e gerar projeto técnico" }).closest("form") as HTMLFormElement);
    await screen.findByRole("alert"); expect(mocks.start).not.toHaveBeenCalled();
  });
});