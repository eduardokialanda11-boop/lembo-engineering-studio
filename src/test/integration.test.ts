import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getUser: vi.fn(), getSession: vi.fn(), from: vi.fn(), storageFrom: vi.fn(), invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getUser: mocks.getUser, getSession: mocks.getSession }, from: mocks.from, storage: { from: mocks.storageFrom }, functions: { invoke: mocks.invoke } } }));
import { projectsApi, componentsApi, assemblyApi, storageApi, analysisApi, buildAnalysisReference, encodeAnalysisImage } from "@/lib/integration";
import { responseFixture } from "./analysis-fixture";
function imageFile(size = 8) {
  const file = new File([new Uint8Array(size)], "original.png", { type: "image/png" });
  Object.defineProperty(file, "arrayBuffer", { value: async () => new Uint8Array([137, 80, 78, 71, 1, 2, 3, 4]).buffer });
  return file;
}
const analysisInput = () => ({ image: imageFile(), name: "Nome informado", description: "Descrição", dimensions: [{ label: "Largura", value: "120" }], notes: "Observação" });

function query(data: unknown, error: unknown = null) {
  const builder: Record<string, unknown> = {};
  for (const key of ["select", "eq", "order", "range", "insert", "single", "maybeSingle"]) builder[key] = vi.fn(() => builder);
  builder["then"] = (resolve: (value: unknown) => void) => resolve({ data, error });
  return builder as Record<string, ReturnType<typeof vi.fn>>;
}
beforeEach(() => { vi.resetAllMocks(); mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } }, error: null }); mocks.getSession.mockResolvedValue({ data: { session: { access_token: "test-only-token" } } }); });
describe("Integração real existente", () => {
  it("lista somente os projetos da conta e não retorna exemplos", async () => {
    const q = query([{ id: "p1", title: "Salvo", image_url: "https://example.com/photo.png" }]); mocks.from.mockReturnValue(q);
    expect(await projectsApi.list()).toHaveLength(1);
    expect(mocks.from).toHaveBeenCalledWith("projects"); expect(q["eq"]).toHaveBeenCalledWith("user_id", "owner"); expect(q["range"]).toHaveBeenCalledWith(0, 499);
  });
  it("busca pelo identificador e proprietário", async () => {
    const q = query(null); mocks.from.mockReturnValue(q);
    expect(await projectsApi.get("p1")).toBeNull(); expect(q["eq"]).toHaveBeenCalledWith("id", "p1"); expect(q["eq"]).toHaveBeenCalledWith("user_id", "owner");
  });
  it("não consulta dados sem usuário autenticado", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
    await expect(projectsApi.list()).rejects.toThrow("Sua sessão expirou"); expect(mocks.from).not.toHaveBeenCalled();
  });
  it("consulta components pelo project_id sem inserir resultados", async () => {
    const q = query([{ id: "c1", project_id: "p1", name: "Peça" }]); mocks.from.mockReturnValue(q);
    expect(await componentsApi.listByProject("p1")).toHaveLength(1); expect(mocks.from).toHaveBeenCalledWith("components"); expect(q["eq"]).toHaveBeenCalledWith("project_id", "p1"); expect(q["insert"]).not.toHaveBeenCalled();
  });
  it("consulta assembly_steps na ordem sem duplicar etapas", async () => {
    const q = query([]); mocks.from.mockReturnValue(q);
    expect(await assemblyApi.listByProject("p1")).toEqual([]); expect(mocks.from).toHaveBeenCalledWith("assembly_steps"); expect(q["order"]).toHaveBeenCalledWith("step_number"); expect(q["insert"]).not.toHaveBeenCalled();
  });
  it("envia uma única imagem para project-images na pasta do proprietário", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null }); mocks.storageFrom.mockReturnValue({ upload });
    const file = new File(["original"], "photo.png", { type: "image/png" });
    const result = await storageApi.uploadImage(file);
    expect(result.bucket).toBe("project-images"); expect(result.path).toMatch(/^owner\/.+\.png$/); expect(upload).toHaveBeenCalledTimes(1); expect(upload).toHaveBeenCalledWith(result.path, file, { upsert: false, contentType: "image/png" });
  });
  it("não envia formato inválido ao Storage", async () => {
    await expect(storageApi.uploadImage(new File(["x"], "photo.pdf", { type: "application/pdf" }))).rejects.toThrow("Formato não aceito"); expect(mocks.storageFrom).not.toHaveBeenCalled();
  });
  it("não declara upload concluído quando o Storage recusa tamanho", async () => {
    mocks.storageFrom.mockReturnValue({ upload: vi.fn().mockResolvedValue({ error: { message: "Payload too large" } }) });
    await expect(storageApi.uploadImage(new File(["x"], "photo.png", { type: "image/png" }))).rejects.toThrow("Payload too large");
  });
  it("cria apenas o rascunho independente com colunas existentes", async () => {
    const q = query({ id: "draft" }); mocks.from.mockReturnValue(q);
    await projectsApi.create({ title: " Rascunho ", image_url: "owner/image.png", reference_measure: "100 mm" });
    expect(q["insert"]).toHaveBeenCalledWith({ title: "Rascunho", image_url: "owner/image.png", reference_measure: "100 mm", user_id: "owner", status: "preliminary", parts_data: [] });
  });
  it("bloqueia análise sem original e não cria registros", async () => {
    await expect(analysisApi.start()).rejects.toThrow("imagem original"); expect(mocks.invoke).not.toHaveBeenCalled(); expect(mocks.from).not.toHaveBeenCalled(); expect(mocks.storageFrom).not.toHaveBeenCalled();
  });
  it("chama somente dynamic-action com imagem Base64, referência e token da conta", async () => {
    mocks.invoke.mockResolvedValue({ data: responseFixture, error: null });
    const result = await analysisApi.start(analysisInput());
    expect(result.project_id).toBe("12345678-1234-4234-8234-123456789abc");
    expect(mocks.invoke).toHaveBeenCalledTimes(1);
    expect(mocks.invoke).toHaveBeenCalledWith("dynamic-action", { body: { image: "data:image/png;base64,iVBORwECAwQ=", referenceMeasure: "Nome informado: Nome informado\nDescrição: Descrição\nMedida informada: Largura = 120 mm\nObservações: Observação" }, headers: { Authorization: "Bearer test-only-token" } });
    expect(mocks.from).not.toHaveBeenCalled(); expect(mocks.storageFrom).not.toHaveBeenCalled();
  });
  it("rejeita resposta sem project_id definitivo", async () => {
    mocks.invoke.mockResolvedValue({ data: { ...responseFixture, project_id: undefined }, error: null });
    await expect(analysisApi.start(analysisInput())).rejects.toThrow("incompleta ou inválida");
  });
  it("não repete o POST quando a função falha", async () => {
    mocks.invoke.mockResolvedValue({ data: null, error: { message: "Falha na OpenAI" } });
    await expect(analysisApi.start(analysisInput())).rejects.toThrow("Falha na OpenAI"); expect(mocks.invoke).toHaveBeenCalledTimes(1);
  });
  it("aceita exatamente 8 MB e rejeita um byte acima", async () => {
    await expect(encodeAnalysisImage(imageFile(8 * 1024 * 1024))).resolves.toContain("data:image/png");
    await expect(encodeAnalysisImage(imageFile(8 * 1024 * 1024 + 1))).rejects.toThrow("8 MB");
  });
  it("não envia metadados truncados acima do limite de 1000 caracteres", () => {
    expect(() => buildAnalysisReference({ ...analysisInput(), description: "a".repeat(1000) })).toThrow("1.000 caracteres");
  });
  it("rejeita BMP antes de chamar a função", async () => {
    const image = new File(["BM"], "original.bmp", { type: "image/bmp" });
    Object.defineProperty(image, "arrayBuffer", { value: async () => new Uint8Array([66, 77]).buffer });
    await expect(analysisApi.start({ ...analysisInput(), image })).rejects.toThrow("JPEG, PNG ou WEBP"); expect(mocks.invoke).not.toHaveBeenCalled();
  });
  it("propaga falhas de consulta sem conteúdo fictício", async () => {
    mocks.from.mockReturnValue(query(null, { message: "Connection failed" })); await expect(projectsApi.list()).rejects.toThrow("Connection failed");
  });
});