import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/components/lembo/ProjectsProvider";
import { pageMeta } from "@/lib/page-meta";
export const Route = createFileRoute("/app/perfil")({ head: () => pageMeta("Perfil do usuário", "Nome de exibição temporário na interface da LEMBO."), component: Profile });
function Profile() {
  const { profileName, setProfileName } = useProjects();
  const [name, setName] = useState(profileName);
  return <div className="mx-auto max-w-3xl space-y-6"><h1 className="text-2xl font-bold text-primary">Perfil do usuário</h1><div className="flex items-center gap-3 border-b pb-5"><UserRound className="h-8 w-8 text-electric" /><div><p className="font-semibold text-primary">{profileName || "Visitante"}</p><p className="text-xs text-muted-foreground">Sessão temporária · sem conta conectada</p></div></div><form className="max-w-md space-y-4" onSubmit={(event) => { event.preventDefault(); setProfileName(name.trim()); toast.success("Nome atualizado nesta sessão."); }}><div className="space-y-2"><Label htmlFor="displayName">Nome de exibição</Label><Input id="displayName" required value={name} onChange={(event) => setName(event.target.value)} /></div><Button type="submit" variant="electric"><Save />Atualizar nome</Button></form></div>;
}