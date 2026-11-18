import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ProjectsProvider, useProjects } from "@/components/lembo/ProjectsProvider";
import { DeleteProjectDialog } from "@/components/lembo/DeleteProjectDialog";
import { projectStats } from "@/lib/project-state";
const navigate = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({ useNavigate: () => navigate }));
vi.mock("@/lib/integration", () => ({ projectsApi: { list: async () => [] } }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { channel: () => ({ on() { return this; }, subscribe() { return this; } }), removeChannel: vi.fn() } }));
function Harness() {
  const { projects, createProject } = useProjects();
  useEffect(() => { for (let i = 0; i < 4; i++) createProject({ name: `Peça ${i}`, description: "", dimensions: [], notes: "", imageUrl: `blob:${i}` }); }, []);
  const [open, setOpen] = useState(true);
  const project = projects[0];
  return <><output aria-label="Total">{projectStats(projects).total}</output>{project && <DeleteProjectDialog project={project} open={open} onOpenChange={setOpen} redirect />}</>;
}
describe("Confirmação de exclusão", () => {
  it("cancelar fecha a janela e preserva todos os projetos", async () => {
    render(<ProjectsProvider><Harness /></ProjectsProvider>);
    await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Total")).toHaveTextContent("4");
  });
  it("confirmar uma única vez elimina e redireciona para o Dashboard", async () => {
    render(<ProjectsProvider><Harness /></ProjectsProvider>);
    const confirm = screen.getByRole("button", { name: "Eliminar projeto" });
    fireEvent.click(confirm); fireEvent.click(confirm);
    expect(confirm).toBeDisabled();
    await waitFor(() => expect(screen.getByLabelText("Total")).toHaveTextContent("3"));
    expect(navigate).toHaveBeenCalledWith({ to: "/app" });
  });
});