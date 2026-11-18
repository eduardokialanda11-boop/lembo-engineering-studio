import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LocalProject } from "@/lib/project-state";
import { ProjectPage } from "@/routes/app.projetos.$id";
const state = vi.hoisted(() => ({ id: "real-project", projects: [] as LocalProject[], deleted: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options, useParams: () => ({ id: state.id }) }),
  Link: ({ to, children, params: _params, ...props }: { to: string; children: React.ReactNode; params?: unknown }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));
vi.mock("@/components/lembo/ProjectsProvider", () => ({ useProjects: () => ({ projects: state.projects, deleteProject: state.deleted }) }));
const project: LocalProject = { id: "real-project", name: "Peça", description: "", createdAt: "2026-11-18", status: "rascunho", isExample: false, imageUrl: "blob:original", dimensions: [], notes: "" };
afterEach(() => cleanup());
describe("Botões dos detalhes", () => {
  it("percorre todas as etapas disponíveis do exemplo e encerra na listagem", () => {
    state.id = "exemplo-suporte";
    state.projects = [{ ...project, id: state.id, isExample: true }];
    render(<ProjectPage />);
    for (const name of [/Análise de engenharia/, /Prancha técnica 2D/, /Peças/, /Entenda o desenho/, /Montagem/, /Histórico/]) {
      fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
      expect(screen.getByRole("tab", { name })).toHaveAttribute("data-state", "active");
    }
    expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Meus projetos/ }).every((link) => link.getAttribute("href") === "/app/meus-projetos")).toBe(true);
  });
  it("vai para análise e volta sem permitir continuar para resultados inexistentes", () => {
    state.id = project.id; state.projects = [project];
    render(<ProjectPage />);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByRole("tab", { name: /Análise de engenharia/ })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Prancha técnica 2D/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByRole("tab", { name: /Imagem e informações/ })).toHaveAttribute("data-state", "active");
  });
  it("a ação principal abre análise sem apresentar resultados simulados", async () => {
    state.id = project.id; state.projects = [project];
    render(<ProjectPage />);
    fireEvent.click(screen.getByRole("button", { name: "Iniciar análise de engenharia" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Iniciar análise de engenharia" })).toBeEnabled());
    expect(screen.getByRole("tab", { name: /Análise de engenharia/ })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });
  it("histórico encerra com retorno à listagem e voltar procura a última etapa disponível", () => {
    state.id = project.id; state.projects = [project];
    render(<ProjectPage />);
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Histórico/ }), { button: 0, ctrlKey: false });
    expect(screen.queryByRole("button", { name: "Continuar" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Meus projetos/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByRole("tab", { name: /Análise de engenharia/ })).toHaveAttribute("data-state", "active");
  });
  it("mantém a exclusão com confirmação e cancelar preserva o projeto", () => {
    state.id = project.id; state.projects = [project]; state.deleted.mockClear();
    render(<ProjectPage />);
    fireEvent.click(screen.getByRole("button", { name: "Eliminar projeto" }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(state.deleted).not.toHaveBeenCalled();
  });
});