import { describe, expect, it } from "vitest";
import { demoDims } from "@/lib/demo-data";
describe("Confiabilidade das dimensões", () => {
  it("medidas desconhecidas nunca exibem valor numérico", () => {
    for (const d of demoDims.filter((x) => x.kind === "unknown")) expect(d.value).toBe("?");
  });
  it("medidas estimadas são sempre marcadas como aproximadas", () => {
    for (const d of demoDims.filter((x) => x.kind === "estimated")) expect(d.value.startsWith("≈")).toBe(true);
  });
});
