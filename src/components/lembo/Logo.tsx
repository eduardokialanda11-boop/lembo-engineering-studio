import { cn } from "@/lib/utils";
import lockup from "@/assets/lembo_logo_lockup.jpg.asset.json";
import symbol from "@/assets/lembo_logo_symbol.jpg.asset.json";
import full from "@/assets/lembo_logo.jpg.asset.json";

/** Logotipo ORIGINAL da LEMBO — usado sem alterações de cor, proporção ou tipografia. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-grid aspect-square shrink-0 place-items-center overflow-hidden rounded-md bg-card p-0.5", className)}>
      <img src={symbol.url} alt="LEMBO" className="h-full w-full object-contain" />
    </span>
  );
}

/** Logotipo completo (símbolo + LEMBO + Visual-to-Engineering), sobre placa clara. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-block overflow-hidden rounded-lg bg-card p-2", className)}>
      <img src={lockup.url} alt="LEMBO — Visual-to-Engineering" className="h-full w-full object-contain" />
    </span>
  );
}

export const logoFullUrl = full.url;
