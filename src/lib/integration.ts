import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { validateImage } from "@/lib/project-state";
// Retained only for compatibility with older UI helpers. Core APIs never use it.
export class NotConnectedError extends Error {
  constructor(feature: string) {
    super(`${feature}: integração com o backend será conectada na próxima etapa.`);
  }
}

const ptBR: Record<string, string> = { "Invalid login credentials": "E-mail ou senha incorretos.", "Email not confirmed": "Confirme seu e-mail pelo link enviado antes de entrar.", "User already registered": "Este e-mail já está cadastrado." };
const ok = <T extends { error: { message: string } | null }>(r: T) => { if (r.error) throw new Error(ptBR[r.error.message] ?? r.error.message); return r; };
export const auth = {
  signIn: async (email: string, password: string) => ok(await supabase.auth.signInWithPassword({ email, password })),
  signUp: async (name: string, email: string, password: string) => ok(await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin } })),
  resetPassword: async (email: string) => ok(await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` })),
  updatePassword: async (password: string) => ok(await supabase.auth.updateUser({ password })),
  signOut: async () => ok(await supabase.auth.signOut()),
};
async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sua sessão expirou. Entre novamente para acessar seus projetos.");
  return data.user;
}

export const imageBucket = "project-images";
export async function resolveProjectImage(value: string): Promise<string> {
  if (!value) return "";
  const base = new URL(import.meta.env['VITE_SUPABASE_URL']);
  let path = value;
  if (/^https?:\/\//i.test(value)) {
    const url = new URL(value);
    const prefix = `/storage/v1/object/`;
    if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) return value;
    const match = url.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/project-images\/(.+)$/);
    if (!match?.[1]) throw new Error("O endereço da imagem salva não pertence ao bucket esperado.");
    path = decodeURIComponent(match[1]);
  }
  path = path.replace(/^project-images\//, "");
  const { data, error } = await supabase.storage.from(imageBucket).createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error(`Não foi possível abrir a imagem privada: ${error?.message ?? "endereço indisponível"}`);
  return data.signedUrl;
}

const withImage = async <T extends { image_url: string }>(row: T): Promise<T> => ({ ...row, image_url: await resolveProjectImage(row.image_url) });
// Pagination prevents the Data API's default 1,000-row cap from hiding records.
const pageSize = 500;
export const projectsApi = {
  list: async () => {
    const user = await requireUser();
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).order("id").range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Não foi possível carregar os projetos: ${error.message}`);
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) break;
    }
    return Promise.all(rows.map(withImage));
  },
  get: async (id: string) => {
    const user = await requireUser();
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
    if (error) throw new Error(`Não foi possível buscar o projeto: ${error.message}`);
    return data ? withImage(data) : null;
  },
  // Independent drafts only. Never call before an analysis owned by dynamic-action.
  create: async (input: Pick<TablesInsert<"projects">, "title" | "image_url" | "reference_measure">) => {
    const user = await requireUser();
    if (!input.title.trim() || !input.image_url) throw new Error("Informe nome e imagem para salvar um rascunho.");
    const { data, error } = await supabase.from("projects").insert({ ...input, title: input.title.trim(), user_id: user.id, status: "preliminary", parts_data: [] }).select("*").single();
    if (error || !data) throw new Error(`Não foi possível salvar o rascunho: ${error?.message ?? "resposta incompleta"}`);
    return data;
  },
};
export const storageApi = {
  uploadImage: async (file: File) => {
    const user = await requireUser();
    validateImage(file);
    if (file.size === 0) throw new Error("A imagem está vazia. Selecione outro arquivo.");
    const extension = file.name.split(".").pop()?.toLowerCase();
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(imageBucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw new Error(`Não foi possível enviar a imagem. Confira o formato e o limite de tamanho do Storage: ${error.message}`);
    return { path, bucket: imageBucket };
  },
};
export interface AnalysisInput {
  image: File;
  name: string;
  description: string;
  dimensions: { label: string; value: string }[];
  referenceMeasure?: string;
  notes: string;
  additionalInstructions?: string;
}
export const analysisFunctionName = "dynamic-action";
export const analysisApi = {
  start: async (_input?: AnalysisInput): Promise<{ project_id: string }> => {
    // Do not guess JSON vs multipart, field names, or upload ownership.
    // No request, upload or insert is made until the deployed source is supplied.
    throw new Error("A análise não foi enviada: falta confirmar o formato de entrada e saída de dynamic-action. Sua imagem e informações continuam nesta sessão; nenhum registro ou upload foi duplicado.");
  },
};
export const componentsApi = {
  listByProject: async (projectId: string) => {
    await requireUser();
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from("components").select("*").eq("project_id", projectId).order("order_index").order("id").range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Não foi possível carregar as peças: ${error.message}`);
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) return rows;
    }
  },
};
export const assemblyApi = {
  listByProject: async (projectId: string) => {
    await requireUser();
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await supabase.from("assembly_steps").select("*").eq("project_id", projectId).order("step_number").order("id").range(offset, offset + pageSize - 1);
      if (error) throw new Error(`Não foi possível carregar a montagem: ${error.message}`);
      rows.push(...(data ?? []));
      if (!data || data.length < pageSize) return rows;
    }
  },
};
