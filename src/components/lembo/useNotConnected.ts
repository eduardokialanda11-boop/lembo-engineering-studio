import { toast } from "sonner";
import { NotConnectedError } from "@/lib/integration";
export async function runIntegration(fn: () => Promise<unknown>) {
  try { await fn(); } catch (e) {
    toast.info(e instanceof NotConnectedError ? e.message : "Erro inesperado.");
  }
}
