import { z } from "zod";

export const maxAnalysisImageBytes = 8 * 1024 * 1024;
export const dimensionSchema = z.object({ name: z.string(), value: z.number().finite().nonnegative().nullable(), unit: z.string(), source: z.enum(["observed", "calculated", "estimated", "unknown"]), note: z.string() });
const coordinate = z.number().finite().min(0).max(1000);
const viewSchema = z.object({
  name: z.string(), status: z.enum(["available", "partial", "requested"]), description: z.string(),
  paths: z.array(z.object({ d: z.string().max(100000), stroke: z.string(), fill: z.string(), stroke_width: z.number().finite().positive() })),
  circles: z.array(z.object({ cx: coordinate, cy: coordinate, r: z.number().finite().positive().max(1000), stroke: z.string(), fill: z.string(), stroke_width: z.number().finite().positive() })),
  dimensions: z.array(dimensionSchema.extend({ x1: coordinate, y1: coordinate, x2: coordinate, y2: coordinate })),
  callouts: z.array(z.object({ label: z.string(), x: coordinate, y: coordinate, target_x: coordinate, target_y: coordinate })),
});
export const analysisSchema = z.object({
  title: z.string().min(1), object_summary: z.string(), analysis_status: z.enum(["preliminary", "needs_more_information"]), reference_measure: z.string().nullable(),
  dimensions: z.array(dimensionSchema),
  components: z.array(z.object({ name: z.string().min(1), quantity: z.number().int().positive(), description: z.string(), technical_description: z.string(), image_emoji: z.string(), dimensions: z.array(dimensionSchema) })),
  technical_drawing: z.object({ title: z.string(), scale: z.string(), views: z.array(viewSchema).min(1).max(4), notes: z.array(z.string()) }),
  assembly_steps: z.array(z.object({ component_name: z.string(), title: z.string(), instruction: z.string(), visual_type: z.enum(["illustration", "diagram", "text", "reference"]), visual_reference: z.string().nullable() })),
  unknowns: z.array(z.string()), safety_warnings: z.array(z.string()),
});
export type EngineeringAnalysis = z.infer<typeof analysisSchema>;
export type EngineeringDimension = z.infer<typeof dimensionSchema>;
export const analysisResponseSchema = z.object({ success: z.literal(true), saved_to_database: z.literal(true), project_id: z.string().uuid(), image_path: z.string().min(1), model: z.string(), analysis: analysisSchema, technical_drawing_svg: z.string().min(1), persistence: z.object({ project: z.literal(true), components: z.number().int().nonnegative(), assembly_steps: z.number().int().nonnegative() }) }).superRefine((result, context) => {
  if (result.persistence.components !== result.analysis.components.length || result.persistence.assembly_steps !== result.analysis.assembly_steps.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "Contagem de persistência incompatível com a análise." });
});
export function parseSavedAnalysis(value: unknown): EngineeringAnalysis | undefined {
  const result = analysisSchema.safeParse(value);
  return result.success ? result.data : undefined;
}
export function formatEngineeringDimension(dimension: EngineeringDimension) {
  if (dimension.source === "unknown" || dimension.value === null) return `${dimension.name}: A DEFINIR`;
  return `${dimension.name}: ${dimension.source === "estimated" ? "≈ " : ""}${dimension.value.toLocaleString("pt-BR")} ${dimension.unit}`;
}