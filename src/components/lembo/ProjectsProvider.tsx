import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { demoProjects } from "@/lib/demo-data";
import { projectFromRow, removeProject, validateProjectInput, type LocalProject } from "@/lib/project-state";
import { supabase } from "@/integrations/supabase/client";

interface Notice { id: string; text: string }
interface ProjectsContextValue {
  projects: LocalProject[];
  createProject: (input: Omit<LocalProject, "id" | "status" | "createdAt" | "isExample">) => LocalProject;
  deleteProject: (id: string) => void;
  query: string;
  setQuery: (query: string) => void;
  profileName: string;
  setProfileName: (name: string) => void;
  compact: boolean;
  setCompact: (value: boolean) => void;
  notices: Notice[];
  clearNotices: () => void;
}
const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<LocalProject[]>(() => demoProjects.map((project) => ({ ...project, isExample: true, dimensions: [], notes: "" })));
  const currentProjects = useRef(projects);
  const imageUrls = useRef(new Set<string>());
  const [query, setQuery] = useState("");
  const [profileName, setProfileName] = useState("");
  const [compact, setCompact] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [remote, setRemote] = useState<LocalProject[]>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.from("projects").select("id,title,image_url,created_at,status,reference_measure").order("created_at", { ascending: false });
      if (!active) return;
      if (error) { notify(`Não foi possível carregar os projetos: ${error.message}`); return; }
      setRemote((data ?? []).map(projectFromRow));
    };
    load();
    const channel = supabase.channel(`projects-${crypto.randomUUID()}`).on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => { load(); }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, []);
  useEffect(() => () => { imageUrls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const notify = (text: string) => setNotices((existing) => [{ id: crypto.randomUUID(), text }, ...existing]);
  const update = (next: LocalProject[]) => { currentProjects.current = next; setProjects(next); };
  const createProject: ProjectsContextValue["createProject"] = (input) => {
    validateProjectInput(input.name, input.dimensions);
    if (!input.imageUrl) throw new Error("Adicione uma imagem de referência.");
    const project: LocalProject = { ...input, name: input.name.trim(), id: crypto.randomUUID(), status: "rascunho", createdAt: new Date().toISOString(), isExample: false, dimensions: input.dimensions.filter((dimension) => dimension.label.trim() && dimension.value.trim()) };
    imageUrls.current.add(input.imageUrl);
    update([project, ...currentProjects.current]);
    notify(`Projeto “${project.name}” criado nesta sessão.`);
    return project;
  };
  const deleteProject = (id: string) => {
    if (remote.some((item) => item.id === id)) throw new Error("Projetos salvos no Supabase não podem ser eliminados nesta etapa.");
    const project = currentProjects.current.find((item) => item.id === id);
    const next = removeProject(currentProjects.current, id);
    update(next);
    if (project?.imageUrl) { URL.revokeObjectURL(project.imageUrl); imageUrls.current.delete(project.imageUrl); }
    notify(`Projeto “${project?.name}” eliminado desta sessão.`);
  };
  return <ProjectsContext.Provider value={{ projects: [...remote, ...projects], createProject, deleteProject, query, setQuery, profileName, setProfileName, compact, setCompact, notices, clearNotices: () => setNotices([]) }}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) throw new Error("ProjectsProvider ausente.");
  return context;
}