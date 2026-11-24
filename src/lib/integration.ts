import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";
import { validateImage } from "@/lib/project-state";
import { analysisResponseSchema, maxAnalysisImageBytes } from "@/lib/analysis-contract";
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
// Short-lived links limit access after sign-out; views request fresh links when reopened.
export const signedImageTtlSeconds = 300;
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
  const { data, error } = await supabase.storage.from(imageBucket).createSignedUrl(path, signedImageTtlSeconds);
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
export function buildAnalysisReference(input: Omit<AnalysisInput, "image">) {
  const text = [
    input.name.trim() && `Nome informado: ${input.name.trim()}`,
    input.description.trim() && `Descrição: ${input.description.trim()}`,
    input.dimensions.filter((d) => d.label.trim() && d.value.trim()).map((d) => `Medida informada: ${d.label} = ${d.value} mm`).join("\n"),
    input.referenceMeasure?.trim() && `Referência: ${input.referenceMeasure.trim()}`,
    input.notes.trim() && `Observações: ${input.notes.trim()}`,
    input.additionalInstructions?.trim() && `Instruções adicionais: ${input.additionalInstructions.trim()}`,
  ].filter(Boolean).join("\n");
  if (text.length > 1000) throw new Error("As informações somadas ultrapassam 1.000 caracteres, limite atual da análise. Reduza os textos; nenhuma informação foi descartada ou enviada.");
  return text;
}
export async function encodeAnalysisImage(file: File) {
  validateImage(file);
  if (file.size === 0 || file.size > maxAnalysisImageBytes) throw new Error("A imagem deve ter até 8 MB e não pode estar vazia.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const webp = bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70 && bytes[8] === 87 && bytes[9] === 69 && bytes[10] === 66 && bytes[11] === 80;
  if (!jpeg && !png && !webp) throw new Error("A análise aceita somente imagens JPEG, PNG ou WEBP. BMP pode ser visualizado, mas precisa ser convertido antes da análise.");
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32768) binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
  return `data:${jpeg ? "image/jpeg" : png ? "image/png" : "image/webp"};base64,${btoa(binary)}`;
}
export const analysisApi = {
  start: async (input?: AnalysisInput) => {
    if (!input) throw new Error("Adicione a imagem original para iniciar uma nova análise.");
    const referenceMeasure = buildAnalysisReference(input);
    const image = await encodeAnalysisImage(input.image);
    await requireUser();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) throw new Error("Sua sessão expirou. Entre novamente.");
    // dynamic-action owns the ONLY upload and inserts. No retry of this POST.
    const { data, error } = await supabase.functions.invoke(analysisFunctionName, { body: { image, referenceMeasure }, headers: { Authorization: `Bearer ${sessionData.session.access_token}` } });
    if (error) {
      let detail = "";
      if (error.context instanceof Response) {
        try { const result = await error.context.clone().json(); detail = typeof result.error === "string" ? result.error : ""; } catch { /* keep transport error */ }
      }
      throw new Error(`${detail || error.message || "Falha ao conectar à análise."} Antes de repetir, confira Meus projetos: uma falha de conexão pode ocorrer após o salvamento.`);
    }
    const result = analysisResponseSchema.safeParse(data);
    if (!result.success) throw new Error("A análise retornou uma resposta incompleta ou inválida. Confira Meus projetos antes de repetir, pois o salvamento pode já ter ocorrido.");
    return result.data;
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
