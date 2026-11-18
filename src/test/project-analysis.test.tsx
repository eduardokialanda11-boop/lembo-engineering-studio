import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectAnalysis } from "@/components/lembo/ProjectAnalysis";
import type { LocalProject } from "@/lib/project-state";
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => vi.fn() }));
vi.mock("@/components/lembo/ProjectsProvider", () => ({ useProjects: () => ({ acceptAnalysis: vi.fn() }) }));
const start = vi.hoisted(() => vi.fn());
vi.mock("@/lib/integration", async (original) => ({ ...await original<typeof import("@/lib/integration")>(), analysisApi: { start } }));
const project: LocalProject = { id: "real-project", name: "Peça", description: "", createdAt: "2026-11-18", status: "rascunho", isExample: false, imageUrl: "blob:original", originalFile: new File(["original"], "original.png", { type: "image/png" }), dimensions: [], notes: "" };
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe("Início de análise", () => {
  it("não envia solicitação quando falta a imagem", async () => {
    const { imageUrl: _imageUrl, ...withoutImage } = project;
    render(<ProjectAnalysis project={withoutImage} />);
    fireEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(start).not.toHaveBeenCalled();
  });
  it("bloqueia solicitações duplicadas e não modifica o status ao encontrar integração pendente", async () => {
    let rejectRequest: ((error: Error) => void) | undefined;
    start.mockImplementation(() => new Promise((_, reject) => { rejectRequest = reject; }));
    render(<ProjectAnalysis project={project} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(start).toHaveBeenCalledTimes(1);
    rejectRequest?.(new Error("Contrato de análise não confirmado"));
    await waitFor(() => expect(button).toBeEnabled());
    expect(project.status).toBe("rascunho");
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
  it("mantém o botão bloqueado durante processamento já informado pelo Supabase", () => {
    render(<ProjectAnalysis project={{ ...project, remote: true, status: "em_analise" }} />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(start).not.toHaveBeenCalled();
  });
});