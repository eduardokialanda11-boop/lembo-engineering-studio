<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- Auth and backend calls go through `src/lib/integration.ts`; dashboard reads real `projects` rows (RLS, realtime) in ProjectsProvider using only existing columns — never invent fields.
- Demo content lives only in `src/lib/demo-data.ts` and must always be shown with a visible "exemplo" badge.
- Brand logo comes from the original uploaded asset pointers in `src/assets/`; never redraw or recolor it.
- Keep temporary frontend projects in an app-layout React provider, without browser persistence or backend calls, so navigation stays synchronized and reload discards the session.
- Own project image object URLs in the shared provider after creation and revoke them on deletion or unmount to preserve previews without leaking memory.
- Project-detail stage access is centralized in project-workflow; real component and assembly tabs query RLS-protected rows independently of status, but a status alone never unlocks a technical drawing.
- Route all data calls through integration.ts and paginate lists; account views never seed demo rows, and private project images use renewable signed URLs because the existing bucket is private.
- Keep analysis drafts in memory with the original File; dynamic-action receives only image Base64 and referenceMeasure (all labeled metadata, maximum 1000 characters) and exclusively owns uploads/inserts; validate its response and replace the local draft with its project_id without automatic POST retries.
- Validate parts_data against the supplied engineering schema before unlocking drawings; render validated SVG primitives through React rather than injecting backend SVG markup, so reload uses persisted analysis safely.
