import { supabase } from "@/integrations/supabase/client";
/**
 * Pontos de integração com o backend Supabase existente (tabelas projects, components,
 * assembly_steps, Storage e Edge Functions). NÃO conectados nesta etapa: os contratos reais
 * (campos, buckets, nomes de funções) serão mapeados na etapa de integração — nada é inventado aqui.
 */
export class NotConnectedError extends Error {
  constructor(feature: string) {
    super(`${feature}: integração com o backend será conectada na próxima etapa.`);
  }
}
const pending = (feature: string) => async (..._args: unknown[]): Promise<never> => {
  throw new NotConnectedError(feature);
};

const ok = <T extends { error: { message: string } | null }>(r: T) => { if (r.error) throw new Error(r.error.message); return r; };
export const auth = {
  signIn: async (email: string, password: string) => ok(await supabase.auth.signInWithPassword({ email, password })),
  signUp: async (name: string, email: string, password: string) => ok(await supabase.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: window.location.origin } })),
  resetPassword: async (email: string) => ok(await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` })),
  updatePassword: async (password: string) => ok(await supabase.auth.updateUser({ password })),
  signOut: async () => ok(await supabase.auth.signOut()),
};
export const projectsApi = {
  list: pending("Consulta de projetos (projects)"),
  get: pending("Consulta do projeto (projects)"),
  create: pending("Criação de projeto (projects)"),
};
export const storageApi = { uploadImage: pending("Upload para Storage") };
export const analysisApi = { start: pending("Edge Function de análise") };
export const componentsApi = { listByProject: pending("Consulta de componentes (components)") };
export const assemblyApi = { listByProject: pending("Consulta de etapas (assembly_steps)") };
