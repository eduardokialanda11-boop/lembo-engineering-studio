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

export const auth = {
  signIn: pending("Login"),
  signUp: pending("Cadastro"),
  resetPassword: pending("Recuperação de senha"),
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
