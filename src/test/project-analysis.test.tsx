import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProjectAnalysis } from "@/components/lembo/ProjectAnalysis";
import { NotConnectedError } from "@/lib/integration";
import type { LocalProject } from "@/lib/project-state";
const start = vi.hoisted(() => vi.fn());
vi.mock("@/lib/integration", async (original) => ({ ...await original<typeof import("@/lib/integration")>(), analysisApi: { start } }));
const project: LocalProject = { id: "real-project", name: "Peça", description: "", createdAt: "2026-11-18", status: "rascunho", isExample: false, imageUrl: "blob:original", dimensions: [], notes: "" };
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
    rejectRequest?.(new NotConnectedError("Análise"));
    await waitFor(() => expect(button).toBeEnabled());
    expect(project.status).toBe("rascunho");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("mantém o botão bloqueado durante processamento já informado pelo Supabase", () => {
    render(<ProjectAnalysis project={{ ...project, remote: true, status: "em_analise" }} />);
    expect(screen.getByRole("button")).toBeDisabled();
    expect(start).not.toHaveBeenCalled();
  });
});