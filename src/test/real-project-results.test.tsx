import { cleanup, render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ pieces: vi.fn(), steps: vi.fn() }));
vi.mock("@/lib/integration", () => ({ componentsApi: { listByProject: api.pieces }, assemblyApi: { listByProject: api.steps } }));
import { RealProjectResults } from "@/components/lembo/RealProjectResults";
afterEach(() => { cleanup(); vi.resetAllMocks(); });
describe("Resultados da conta", () => {
  it("lê peças reais sem acrescentar peças demonstrativas", async () => {
    api.pieces.mockResolvedValue([{ id: "c1", name: "Peça real", quantity: 2, description: "Registrada", validation_status: "pending" }]);
    render(<RealProjectResults projectId="p1" kind="pieces" />);
    await screen.findByText("Peça real");
    expect(api.pieces).toHaveBeenCalledWith("p1"); expect(screen.getAllByRole("article")).toHaveLength(1);
  });
  it("mantém montagem vazia quando não há etapas salvas", async () => {
    api.steps.mockResolvedValue([]);
    render(<RealProjectResults projectId="p1" kind="assembly" />);
    await waitFor(() => expect(api.steps).toHaveBeenCalledWith("p1"));
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
  it("permite consultar novamente após erro sem inserir dados", async () => {
    api.steps.mockRejectedValueOnce(new Error("Falha de conexão")).mockResolvedValueOnce([{ id: "s1", step_number: 1, title: "Etapa salva", instruction: "Instrução real", component_name: "Peça", estimated_duration_minutes: null }]);
    render(<RealProjectResults projectId="p1" kind="assembly" />);
    await screen.findByRole("alert"); fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await screen.findByText("Etapa salva"); expect(api.steps).toHaveBeenCalledTimes(2);
  });
});