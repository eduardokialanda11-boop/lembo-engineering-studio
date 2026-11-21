import { z } from "zod";

export const maxAnalysisImageBytes = 8 * 1024 * 1024;

export const measurementSources = ["provided", "observed", "calculated", "estimated", "unknown"] as const;

export const viewKinds = ["front", "top", "side", "isometric", "exploded"] as const;

const allowedColorNames = new Set([
  "none",
  "transparent",
  "black",
  "white",
  "red",
  "green",
  "blue",
  "orange",
  "yellow",
  "gray",
  "grey",
  "darkgray",
  "darkgrey",
  "lightgray",
  "lightgrey",
  "steelblue",
]);

const svgColorSchema = z
  .string()
  .max(40)
  .refine((value) => {
    const normalized = value.trim().toLowerCase();

    return allowedColorNames.has(normalized) || /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(normalized);
  }, "Cor SVG inválida.");

const coordinate = z.number().finite().min(0).max(1000);

/**
 * Validador estrutural de caminhos SVG.
 * Confere comandos, argumentos, números e flags de arcos.
 * Não substitui uma validação geométrica ou mecânica.
 */
export function validateSvgPath(d: string): boolean {
  if (!d || d.length > 100000) return false;

  const tokenRegex = /[MmLlHhVvCcSsQqTtAaZz]|[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/gy;

  const tokens: string[] = [];
  let position = 0;

  while (position < d.length) {
    tokenRegex.lastIndex = position;
    const match = tokenRegex.exec(d);

    if (match) {
      tokens.push(match[0]);
      position = tokenRegex.lastIndex;
      continue;
    }

    const separator = d[position];

    if (separator === "," || (separator !== undefined && /\s/.test(separator))) {
      position++;
      continue;
    }

    return false;
  }

  if (!tokens[0] || !/^[Mm]$/.test(tokens[0])) {
    return false;
  }

  const argsPerCommand: Record<string, number> = {
    M: 2,
    m: 2,
    L: 2,
    l: 2,
    H: 1,
    h: 1,
    V: 1,
    v: 1,
    C: 6,
    c: 6,
    S: 4,
    s: 4,
    Q: 4,
    q: 4,
    T: 2,
    t: 2,
    A: 7,
    a: 7,
    Z: 0,
    z: 0,
  };

  const isCommand = (token: string) => /^[MmLlHhVvCcSsQqTtAaZz]$/.test(token);

  let index = 0;
  let currentCommand: string | null = null;

  while (index < tokens.length) {
    const token = tokens[index];
    if (token === undefined) return false;

    if (isCommand(token)) {
      currentCommand = token;
      index++;

      if (currentCommand === "Z" || currentCommand === "z") {
        currentCommand = null;
        continue;
      }
    } else if (!currentCommand) {
      return false;
    }

    if (!currentCommand) return false;

    const command = currentCommand;
    const required = argsPerCommand[command];
    if (required === undefined || required === 0) return false;

    const start = index;

    while (index < tokens.length && !isCommand(tokens[index] ?? "")) {
      const value = Number(tokens[index]);

      if (!Number.isFinite(value)) return false;

      index++;
    }

    const count = index - start;

    if (count < required || count % required !== 0) {
      return false;
    }

    // Arcos: raios não negativos e flags limitadas a 0 ou 1.
    if (command === "A" || command === "a") {
      for (let i = start; i < index; i += 7) {
        const rx = Number(tokens[i]);
        const ry = Number(tokens[i + 1]);
        const largeArcFlag = Number(tokens[i + 3]);
        const sweepFlag = Number(tokens[i + 4]);

        if (rx < 0 || ry < 0 || ![0, 1].includes(largeArcFlag) || ![0, 1].includes(sweepFlag)) {
          return false;
        }
      }
    }

    // Coordenadas adicionais após M/m usam L/l.
    if (command === "M") currentCommand = "L";
    if (command === "m") currentCommand = "l";
  }

  return currentCommand !== null || tokens[tokens.length - 1] === "Z" || tokens[tokens.length - 1] === "z";
}

const dimensionObjectSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    value: z.number().finite().nonnegative().nullable(),
    unit: z.string().max(20),
    source: z.enum(measurementSources),
    note: z.string().max(500).optional().default(""),
  });

function validateDimension(dimension: z.infer<typeof dimensionObjectSchema>, context: z.RefinementCtx) {
    if (dimension.source === "unknown" && dimension.value !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Uma dimensão desconhecida não pode apresentar valor numérico.",
        path: ["value"],
      });
    }

    if (dimension.source !== "unknown" && dimension.value === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Uma dimensão identificada precisa apresentar um valor.",
        path: ["value"],
      });
    }
  }

export const dimensionSchema = dimensionObjectSchema.superRefine(validateDimension);

const pathSchema = z.object({
  d: z.string().min(1).max(100000).refine(validateSvgPath, "Caminho SVG estruturalmente inválido."),
  stroke: svgColorSchema,
  fill: svgColorSchema,
  stroke_width: z.number().finite().positive().max(30),
});

const circleSchema = z.object({
  cx: coordinate,
  cy: coordinate,
  r: z.number().finite().positive().max(1000),
  stroke: svgColorSchema,
  fill: svgColorSchema,
  stroke_width: z.number().finite().positive().max(30),
});

const viewDimensionSchema = dimensionObjectSchema.extend({
  x1: coordinate,
  y1: coordinate,
  x2: coordinate,
  y2: coordinate,
  component_id: z.string().min(1).max(80).nullable().optional(),
}).superRefine(validateDimension);

const calloutSchema = z.object({
  label: z.string().trim().min(1).max(100),
  x: coordinate,
  y: coordinate,
  target_x: coordinate,
  target_y: coordinate,
  component_id: z.string().min(1).max(80).nullable(),
});

const viewSchema = z
  .object({
    kind: z.enum(viewKinds),
    name: z.string().trim().min(1).max(100),
    status: z.enum(["available", "partial", "requested"]),
    description: z.string().max(1000),
    paths: z.array(pathSchema).max(300),
    circles: z.array(circleSchema).max(300),
    dimensions: z.array(viewDimensionSchema).max(200),
    callouts: z.array(calloutSchema).max(200),
  })
  .superRefine((view, context) => {
    if (
      view.status === "requested" &&
      (view.paths.length > 0 || view.circles.length > 0 || view.dimensions.length > 0 || view.callouts.length > 0)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Uma vista solicitada não pode conter geometria, cotas ou chamadas.",
        path: ["status"],
      });
    }
  });

const componentSchema = z.object({
  component_id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(150),
  quantity: z.number().int().positive().max(10000),
  description: z.string().max(2000),
  technical_description: z.string().max(3000).optional().default(""),
  image_emoji: z.string().max(20).optional().default(""),
  dimensions: z.array(dimensionSchema).max(100),
});

const assemblyStepSchema = z.object({
  step_number: z.number().int().positive(),
  component_ids: z.array(z.string().min(1).max(80)).max(100),
  component_name: z.string().max(150),
  title: z.string().trim().min(1).max(200),
  instruction: z.string().trim().min(1).max(3000),
  visual_type: z.enum(["illustration", "diagram", "text", "reference"]),
  visual_reference: z.string().max(1000).nullable(),
});

export const analysisSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    object_summary: z.string().max(3000),
    analysis_status: z.enum(["preliminary", "needs_more_information"]),
    reference_measure: z.string().max(2000).nullable(),

    dimensions: z.array(dimensionSchema).max(200),
    components: z.array(componentSchema).max(200),

    technical_drawing: z.object({
      title: z.string().trim().min(1).max(200),
      scale: z.string().max(50),
      views: z.array(viewSchema).length(5),
      notes: z.array(z.string().max(1000)).max(100),
    }),

    assembly_steps: z.array(assemblyStepSchema).max(200),
    unknowns: z.array(z.string().max(1000)).max(100),
    safety_warnings: z.array(z.string().max(1000)).max(100),
  })
  .superRefine((analysis, context) => {
    const receivedKinds = analysis.technical_drawing.views.map((view) => view.kind);

    if (new Set(receivedKinds).size !== viewKinds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A prancha deve conter exatamente uma unidade de cada uma das cinco vistas.",
        path: ["technical_drawing", "views"],
      });
    }

    const componentIds = new Set(analysis.components.map((component) => component.component_id));

    if (componentIds.size !== analysis.components.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Existem identificadores de componentes duplicados.",
        path: ["components"],
      });
    }

    analysis.technical_drawing.views.forEach((view, viewIndex) => {
      view.callouts.forEach((callout, calloutIndex) => {
        if (callout.component_id !== null && !componentIds.has(callout.component_id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Chamada referencia componente inexistente.",
            path: ["technical_drawing", "views", viewIndex, "callouts", calloutIndex, "component_id"],
          });
        }
      });

      view.dimensions.forEach((dimension, dimensionIndex) => {
        if (dimension.component_id && !componentIds.has(dimension.component_id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cota referencia componente inexistente.",
            path: ["technical_drawing", "views", viewIndex, "dimensions", dimensionIndex, "component_id"],
          });
        }
      });
    });

    const seenStepNumbers = new Set<number>();

    analysis.assembly_steps.forEach((step, stepIndex) => {
      if (step.step_number !== stepIndex + 1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "As etapas devem estar ordenadas e numeradas sequencialmente a partir de 1.",
          path: ["assembly_steps", stepIndex, "step_number"],
        });
      }

      if (seenStepNumbers.has(step.step_number)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Número de etapa repetido: ${step.step_number}.`,
          path: ["assembly_steps", stepIndex, "step_number"],
        });
      }

      seenStepNumbers.add(step.step_number);

      if (new Set(step.component_ids).size !== step.component_ids.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Etapa contém componente duplicado.",
          path: ["assembly_steps", stepIndex, "component_ids"],
        });
      }

      step.component_ids.forEach((componentId) => {
        if (!componentIds.has(componentId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Etapa referencia componente inexistente.",
            path: ["assembly_steps", stepIndex, "component_ids"],
          });
        }
      });
    });
  });

export type EngineeringAnalysis = z.infer<typeof analysisSchema>;
export type EngineeringDimension = z.infer<typeof dimensionSchema>;
export type EngineeringComponent = z.infer<typeof componentSchema>;
export type EngineeringView = z.infer<typeof viewSchema>;
export type EngineeringViewKind = (typeof viewKinds)[number];
export type MeasurementSource = (typeof measurementSources)[number];

export const analysisResponseSchema = z
  .object({
    success: z.literal(true),
    saved_to_database: z.literal(true),
    project_id: z.string().uuid(),
    image_path: z.string().min(1),
    model: z.string(),
    analysis: analysisSchema,
    technical_drawing_svg: z.string().min(1).optional(),
    persistence: z.object({
      project: z.literal(true),
      components: z.number().int().nonnegative(),
      assembly_steps: z.number().int().nonnegative(),
    }),
  })
  .superRefine((result, context) => {
    if (
      result.persistence.components !== result.analysis.components.length ||
      result.persistence.assembly_steps !== result.analysis.assembly_steps.length
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Contagem de persistência incompatível com a análise.",
      });
    }
  });

function inferLegacyViewKind(name: string): EngineeringViewKind | undefined {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/frontal|frente/.test(normalized)) return "front";
  if (/superior|cima|top/.test(normalized)) return "top";
  if (/lateral|lado|side/.test(normalized)) return "side";
  if (/isometr/.test(normalized)) return "isometric";
  if (/explod/.test(normalized)) return "exploded";

  return undefined;
}

const viewDisplayNames: Record<EngineeringViewKind, string> = {
  front: "Vista frontal",
  top: "Vista superior",
  side: "Vista lateral",
  isometric: "Vista isométrica",
  exploded: "Vista explodida",
};

function normalizeLegacyName(value: string): string {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export function parseSavedAnalysis(value: unknown): EngineeringAnalysis | undefined {
  const current = analysisSchema.safeParse(value);
  if (current.success) return current.data;

  if (!value || typeof value !== "object") return undefined;

  const legacy = value as Record<string, unknown>;

  if (
    !Array.isArray(legacy["components"]) ||
    !Array.isArray(legacy["assembly_steps"]) ||
    !legacy["technical_drawing"] ||
    typeof legacy["technical_drawing"] !== "object"
  ) {
    return undefined;
  }

  const drawing = legacy["technical_drawing"] as Record<string, unknown>;
  if (!Array.isArray(drawing["views"])) return undefined;

  // Recupera componentes e garante IDs únicos.
  const usedIds = new Set<string>();
  const originalIdCounts = new Map<string, number>();

  legacy["components"].forEach((item) => {
    if (item && typeof item === "object" && typeof (item as Record<string, unknown>)["component_id"] === "string") {
      const id = (item as Record<string, unknown>)["component_id"] as string;
      originalIdCounts.set(id, (originalIdCounts.get(id) ?? 0) + 1);
    }
  });

  const oldIdToNewId = new Map<string, string>();

  const components = legacy["components"].map((item, index) => {
    if (!item || typeof item !== "object") return item;

    const component = item as Record<string, unknown>;
    const oldId = typeof component["component_id"] === "string" ? component["component_id"] : "";

    let newId = oldId;

    if (!newId || usedIds.has(newId)) {
      newId = `legacy-component-${index + 1}`;

      while (usedIds.has(newId)) {
        newId = `${newId}-copy`;
      }
    }

    usedIds.add(newId);

    if (oldId && originalIdCounts.get(oldId) === 1) {
      oldIdToNewId.set(oldId, newId);
    }

    return {
      ...component,
      component_id: newId,
      name:
        typeof component["name"] === "string" && component["name"].trim() ? component["name"].trim() : `Componente ${index + 1}`,
      quantity:
        typeof component["quantity"] === "number" && Number.isInteger(component["quantity"]) && component["quantity"] > 0
          ? component["quantity"]
          : 1,
      description: typeof component["description"] === "string" ? component["description"] : "",
      technical_description: typeof component["technical_description"] === "string" ? component["technical_description"] : "",
      image_emoji: typeof component["image_emoji"] === "string" ? component["image_emoji"] : "",
      dimensions: Array.isArray(component["dimensions"]) ? component["dimensions"] : [],
    };
  });

  const validComponentIds = new Set(
    components
      .map((item) => (item && typeof item === "object" ? (item as Record<string, unknown>)["component_id"] : undefined))
      .filter((id): id is string => typeof id === "string"),
  );

  // Nome -> ID somente quando o nome é único.
  const nameCounts = new Map<string, number>();

  components.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const component = item as Record<string, unknown>;
    if (typeof component["name"] !== "string") return;

    const name = normalizeLegacyName(component["name"]);
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
  });

  const componentIdByName = new Map<string, string>();

  components.forEach((item) => {
    if (!item || typeof item !== "object") return;

    const component = item as Record<string, unknown>;
    if (typeof component["name"] !== "string" || typeof component["component_id"] !== "string") return;

    const name = normalizeLegacyName(component["name"]);

    if (nameCounts.get(name) === 1) {
      componentIdByName.set(name, component["component_id"]);
    }
  });

  // Recupera as vistas antigas.
  const seenKinds = new Set<string>();
  const views: Record<string, unknown>[] = [];

  drawing["views"].forEach((item) => {
    if (!item || typeof item !== "object") return;

    const view = item as Record<string, unknown>;

    const parsedKind = z.enum(viewKinds).safeParse(view["kind"]);
    const kind =
      parsedKind.success
        ? parsedKind.data
        : typeof view["name"] === "string"
          ? inferLegacyViewKind(view["name"])
          : undefined;

    if (!kind || seenKinds.has(kind)) return;

    seenKinds.add(kind);

    const isRequested = view["status"] === "requested";

    const paths = isRequested ? [] : Array.isArray(view["paths"]) ? view["paths"] : [];

    const circles = isRequested ? [] : Array.isArray(view["circles"]) ? view["circles"] : [];

    const dimensions = isRequested
      ? []
      : Array.isArray(view["dimensions"])
        ? view["dimensions"].map((item) => {
            if (!item || typeof item !== "object") return item;

            const dimension = item as Record<string, unknown>;
            const oldId = dimension["component_id"];

            return {
              ...dimension,
              component_id: typeof oldId === "string" ? (oldIdToNewId.get(oldId) ?? null) : null,
            };
          })
        : [];

    const callouts = isRequested
      ? []
      : Array.isArray(view["callouts"])
        ? view["callouts"].map((item) => {
            if (!item || typeof item !== "object") return item;

            const callout = item as Record<string, unknown>;
            const oldId = callout["component_id"];

            return {
              ...callout,
              component_id: typeof oldId === "string" ? (oldIdToNewId.get(oldId) ?? null) : null,
            };
          })
        : [];

    const hasGeometry = paths.length > 0 || circles.length > 0 || dimensions.length > 0 || callouts.length > 0;

    const status = isRequested
      ? "requested"
      : view["status"] === "partial" || view["status"] === "available"
        ? view["status"]
        : hasGeometry
          ? "partial"
          : "requested";

    views.push({
      ...view,
      kind,
      name: typeof view["name"] === "string" && view["name"].trim() ? view["name"] : viewDisplayNames[kind],
      status,
      description: typeof view["description"] === "string" ? view["description"] : "Vista recuperada de um projeto anterior.",
      paths: status === "requested" ? [] : paths,
      circles: status === "requested" ? [] : circles,
      dimensions: status === "requested" ? [] : dimensions,
      callouts: status === "requested" ? [] : callouts,
    });
  });

  // Cria as vistas ausentes como requested.
  for (const kind of viewKinds) {
    if (!seenKinds.has(kind)) {
      views.push({
        kind,
        name: viewDisplayNames[kind],
        status: "requested",
        description: "Vista não gerada na análise original. Uma nova análise poderá ser necessária.",
        paths: [],
        circles: [],
        dimensions: [],
        callouts: [],
      });
    }
  }

  views.sort(
    (a, b) => viewKinds.indexOf(a["kind"] as EngineeringViewKind) - viewKinds.indexOf(b["kind"] as EngineeringViewKind),
  );

  // Recupera etapas e reconstrói vínculos seguros.
  const assemblySteps = legacy["assembly_steps"].map((item, index) => {
    if (!item || typeof item !== "object") return item;

    const step = item as Record<string, unknown>;

    const componentName = typeof step["component_name"] === "string" ? step["component_name"] : "";

    let componentIds: string[] = [];

    if (Array.isArray(step["component_ids"])) {
      componentIds = [
        ...new Set(
          step["component_ids"]
            .filter((id): id is string => typeof id === "string")
            .map((id) => oldIdToNewId.get(id))
            .filter((id): id is string => typeof id === "string" && validComponentIds.has(id)),
        ),
      ];
    }

    if (componentIds.length === 0 && componentName) {
      const linkedId = componentIdByName.get(normalizeLegacyName(componentName));

      if (linkedId) componentIds = [linkedId];
    }

    return {
      ...step,
      step_number: index + 1,
      component_ids: componentIds,
      component_name: componentName,
      title: typeof step["title"] === "string" && step["title"].trim() ? step["title"] : `Etapa ${index + 1}`,
      instruction:
        typeof step["instruction"] === "string" && step["instruction"].trim()
          ? step["instruction"]
          : "Instrução não disponível no registro original. Revisão necessária.",
      visual_type: ["illustration", "diagram", "text", "reference"].includes(String(step["visual_type"]))
        ? step["visual_type"]
        : "text",
      visual_reference: typeof step["visual_reference"] === "string" ? step["visual_reference"] : null,
    };
  });

  const migrated = {
    ...legacy,
    title: typeof legacy["title"] === "string" && legacy["title"].trim() ? legacy["title"] : "Projeto recuperado",
    object_summary: typeof legacy["object_summary"] === "string" ? legacy["object_summary"] : "",
    analysis_status: legacy["analysis_status"] === "needs_more_information" ? "needs_more_information" : "preliminary",
    reference_measure: typeof legacy["reference_measure"] === "string" ? legacy["reference_measure"] : null,
    dimensions: Array.isArray(legacy["dimensions"]) ? legacy["dimensions"] : [],
    components,
    technical_drawing: {
      ...drawing,
      title: typeof drawing["title"] === "string" && drawing["title"].trim() ? drawing["title"] : "Prancha técnica",
      scale: typeof drawing["scale"] === "string" ? drawing["scale"] : "Não definida",
      views,
      notes: Array.isArray(drawing["notes"]) ? drawing["notes"] : [],
    },
    assembly_steps: assemblySteps,
    unknowns: Array.isArray(legacy["unknowns"]) ? legacy["unknowns"] : [],
    safety_warnings: Array.isArray(legacy["safety_warnings"]) ? legacy["safety_warnings"] : [],
  };

  const result = analysisSchema.safeParse(migrated);

  return result.success ? result.data : undefined;
}

export function formatEngineeringDimension(dimension: EngineeringDimension) {
  if (dimension["source"] === "unknown" || dimension["value"] === null) {
    return `${dimension["name"]}: A DEFINIR`;
  }

  const prefix = dimension["source"] === "estimated" ? "≈ " : "";

  return `${dimension["name"]}: ${prefix}${dimension["value"].toLocaleString("pt-BR")} ${dimension["unit"]}`;
}
