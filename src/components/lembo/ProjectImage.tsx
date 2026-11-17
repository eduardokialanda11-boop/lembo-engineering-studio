import { ImageIcon } from "lucide-react";
import type { LocalProject } from "@/lib/project-state";
import { Thumb } from "./Thumb";
export function ProjectImage({ project }: { project: LocalProject }) {
  if (project.imageUrl) return <img src={project.imageUrl} alt={`Referência de ${project.name}`} className="h-full w-full object-contain" />;
  if (project.isExample && project.thumb) return <Thumb kind={project.thumb} />;
  return <div className="grid h-full w-full place-items-center bg-muted"><ImageIcon className="text-muted-foreground" /></div>;
}