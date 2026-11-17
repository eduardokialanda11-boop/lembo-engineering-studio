import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppSidebar } from "@/components/lembo/AppSidebar";
const sidebar = vi.hoisted(() => ({ state: "expanded", isMobile: true, setOpenMobile: vi.fn() }));
vi.mock("@/components/ui/sidebar", async (original) => ({ ...await original<typeof import("@/components/ui/sidebar")>(), useSidebar: () => sidebar, Sidebar: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>, SidebarMenuButton: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("@/lib/integration", () => ({ auth: { signOut: async () => undefined } }));
vi.mock("@tanstack/react-router", () => ({ useRouterState: () => "/app", useNavigate: () => () => undefined, Link: ({ children, to, onClick, ...props }: { children: React.ReactNode; to: string; onClick?: () => void }) => <a href={to} {...props} onClick={(event) => { event.preventDefault(); onClick?.(); }}>{children}</a> }));
describe("Navegação do menu móvel", () => {
  it("fecha o menu ao abrir cada destino para revelar a página", () => {
    render(<AppSidebar />);
    for (const name of ["Dashboard", "Meus projetos", "Novo projeto", "Ajuda", "Configurações", "Perfil do usuário", "Sair"]) {
      sidebar.setOpenMobile.mockClear();
      fireEvent.click(name === "Sair" ? screen.getByRole("button", { name }) : screen.getByRole("link", { name }));
      expect(sidebar.setOpenMobile).toHaveBeenCalledWith(false);
    }
  });
});