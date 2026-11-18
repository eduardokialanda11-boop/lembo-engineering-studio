import type { DemoProject, ProjectStatus } from "./demo-data";

/** Frontend-only model; not a contract for the existing backend. */
export interface LocalProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  status: ProjectStatus;
  imageUrl?: string;
  imageName?: string;
  originalFile?: File;
  thumb?: DemoProject["thumb"];
  isExample: boolean;
  /** Linha real da tabela projects do Supabase. */
  remote?: boolean;
  dimensions: { label: string; value: string }[];
  notes: string;
}

export const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/bmp"];
export const acceptedImageExtensions = ["jpg", "jpeg", "png", "webp", "bmp"];
export const imageAccept = acceptedImageTypes.join(",");

export function validateImage(file: Pick<File, "name" | "type">) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!acceptedImageExtensions.includes(extension) || (file.type && !acceptedImageTypes.includes(file.type))) {
    throw new Error("Formato não aceito. Selecione uma imagem JPG, PNG, WEBP ou BMP.");
  }
}

export function removeProject(projects: LocalProject[], id: string) {
  if (!projects.some((project) => project.id === id)) throw new Error("O projeto não está mais disponível nesta sessão.");
  return projects.filter((project) => project.id !== id);
}

export function projectStats(projects: LocalProject[]) {
  return {
    total: projects.length,
    analysis: projects.filter((project) => project.status === "em_analise").length,
    completed: projects.filter((project) => project.status === "concluido").length,
  };
}

export function filterProjects(projects: LocalProject[], query: string, status: ProjectStatus | "todos") {
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  return projects.filter((project) => (status === "todos" || project.status === status) && project.name.toLocaleLowerCase("pt-BR").includes(normalized));
}

export function validateProjectInput(name: string, dimensions: LocalProject["dimensions"]) {
  if (!name.trim()) throw new Error("Informe o nome do projeto.");
  for (const dimension of dimensions) {
    if (!dimension.label.trim() && !dimension.value.trim()) continue;
    if (!dimension.label.trim() || !dimension.value.trim() || !Number.isFinite(Number(dimension.value)) || Number(dimension.value) <= 0) {
      throw new Error("Informe o nome e um valor maior que zero para cada medida, ou remova a medida incompleta.");
    }
  }
}
/** Converte uma linha real de projects usando só colunas existentes. */
export function projectFromRow(row: { id: string; title: string; image_url: string; created_at: string | null; status: string | null; reference_measure: string | null }): LocalProject {
  const map: Record<string, ProjectStatus> = { preliminary: "rascunho", draft: "rascunho", completed: "concluido", done: "concluido", error: "erro", failed: "erro" };
  return { id: row.id, name: row.title, description: "", createdAt: row.created_at ?? new Date().toISOString(), status: map[row.status ?? "preliminary"] ?? "em_analise", ...(row.image_url ? { imageUrl: row.image_url } : {}), isExample: false, remote: true, dimensions: row.reference_measure ? [{ label: "Medida de referência", value: row.reference_measure }] : [], notes: "" };
}
