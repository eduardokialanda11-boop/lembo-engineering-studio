import { toast } from "sonner";
import { NotConnectedError } from "@/lib/integration";
export async function runIntegration(fn: () => Promise<unknown>) {
  try { await fn(); return true; } catch (e) {
    if (e instanceof NotConnectedError) toast.info(e.message);
    else toast.error(e instanceof Error ? e.message : "Erro inesperado.");
    return false;
  }
}
