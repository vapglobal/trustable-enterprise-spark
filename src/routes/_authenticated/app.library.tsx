import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, type DragEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ExternalLink, FileText, Image as ImageIcon, Link2, Pin, StickyNote, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProofBadge } from "@/components/trustable/Chrome";
import { addFile, addLink, addNote, fmtSize, itemAsText, listLibrary, removeItem, signedUrl, togglePin, type LibraryItem } from "@/lib/library";
import { pageMeta } from "@/lib/site";
import { EmphasizedField } from "@/components/trustable/EmphasizedField";

export const Route = createFileRoute("/_authenticated/app/library")({
  head: () => pageMeta({ title: "Library — Trustable", description: "Your private library of files, links and notes.", path: "/app/library", index: false }),
  component: LibraryPage,
});

const QUICK = [{ title: "Trustable interview package (CareerCaptain)", url: "https://careercaptain.ai/demo/trustable", tags: ["interview", "trustable"] }];
type Filter = "all" | "file" | "link" | "note" | "image";
const parseTags = (s: string) => s.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 12);

function LibraryPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["library"], queryFn: listLibrary });
  const [filter, setFilter] = useState<Filter>("all");
  const [tag, setTag] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [note, setNote] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<{ item: LibraryItem; src: string | null } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["library"] });
  async function act(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try { await fn(); toast.success(ok); await refresh(); } catch (e) { toast.error(e instanceof Error ? e.message : "Something went wrong"); } finally { setBusy(false); }
  }
  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (!list.length) return;
    await act(async () => { for (const f of list) await addFile(f, parseTags(tags)); }, `${list.length} file${list.length > 1 ? "s" : ""} added`);
  }
  async function onDrop(e: DragEvent) {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files.length) return uploadFiles(e.dataTransfer.files);
    const text = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
    if (/^https?:\/\//i.test(text.trim())) await act(() => addLink(text.trim().split("\n")[0]!, undefined, parseTags(tags)), "Link added");
    else if (text.trim()) await act(() => addNote(text.trim().slice(0, 60), text, parseTags(tags)), "Note added");
  }
  async function open(item: LibraryItem) {
    try { setPreview({ item, src: item.storage_path ? await signedUrl(item) : item.url }); } catch (e) { toast.error(e instanceof Error ? e.message : "Could not open"); }
  }

  const allTags = [...new Set(data.flatMap((i) => i.tags))].sort();
  const shown = data.filter((i) =>
    (filter === "all" || (filter === "image" ? i.mime_type?.startsWith("image/") : i.kind === filter)) &&
    (!tag || i.tags.includes(tag)) &&
    (i.title + " " + (i.url ?? "") + " " + i.tags.join(" ")).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Library</h1>
          <p className="text-sm text-muted-foreground">Your private files, links and notes. Insert any of them into Trustable Flow and other forms.</p>
        </div>
        <ProofBadge kind="live" />
      </div>

      <section
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
        className={`panel grid gap-5 p-5 lg:grid-cols-3 ${drag ? "ring-2 ring-primary" : ""}`}>
        <div className="space-y-2">
          <p className="eyebrow">Files</p>
          <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
            className="flex h-28 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-foreground">
            <Upload className="mb-1 h-5 w-5" /> Drop files, links or text here, or click to browse
            <span className="text-[11px]">Any type, up to 50 MB each</span>
          </button>
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />
          <EmphasizedField label="Tags" value={tags} onChange={setTags}><Input placeholder="Tags for new items, comma separated" value={tags} onChange={(e) => setTags(e.target.value)} /></EmphasizedField>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Link</p>
          <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); act(() => addLink(url, undefined, parseTags(tags)), "Link added").then(() => setUrl("")); }}>
            <EmphasizedField label="URL" value={url} onChange={setUrl}><Input type="url" required placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} /></EmphasizedField>
            <Button disabled={busy}>Add</Button>
          </form>
          {QUICK.filter((qk) => !data.some((d) => d.url === qk.url)).map((qk) => (
            <Button key={qk.url} variant="outline" size="sm" className="w-full justify-start" disabled={busy} onClick={() => act(() => addLink(qk.url, qk.title, qk.tags), "Link added")}>
              <Link2 className="mr-2 h-4 w-4" /> Add: {qk.title}
            </Button>
          ))}
        </div>
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); act(() => addNote(note.title, note.body, parseTags(tags)), "Note saved").then(() => setNote({ title: "", body: "" })); }}>
          <p className="eyebrow">Note</p>
          <EmphasizedField label="Title" value={note.title} onChange={(title) => setNote({ ...note, title })}><Input placeholder="Title" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} /></EmphasizedField>
          <EmphasizedField label="Context" value={note.body} onChange={(body) => setNote({ ...note, body })}><Textarea rows={2} required placeholder="Paste any context, talking points or prompts" value={note.body} onChange={(e) => setNote({ ...note, body: e.target.value })} /></EmphasizedField>
          <Button size="sm" disabled={busy}>Save note</Button>
        </form>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "file", "image", "link", "note"] as Filter[]).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f === "all" ? "All" : f + "s"}</Button>
        ))}
        {allTags.map((t) => (
          <button key={t} onClick={() => setTag(tag === t ? null : t)} className={`rounded-full border px-2.5 py-0.5 text-xs ${tag === t ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>#{t}</button>
        ))}
        <Input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} className="ml-auto h-8 w-56" />
      </div>

      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : shown.length === 0 ? (
        <p className="panel p-8 text-center text-sm text-muted-foreground">{data.length ? "No items match these filters." : "Your library is empty. Drop something above to start."}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => {
            const Icon = i.kind === "link" ? Link2 : i.kind === "note" ? StickyNote : i.mime_type?.startsWith("image/") ? ImageIcon : FileText;
            return (
              <div key={i.id} className="panel flex flex-col p-4">
                <button onClick={() => open(i)} className="flex items-start gap-3 text-left">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{i.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {i.kind === "link" ? i.url : i.kind === "note" ? (i.body ?? "").slice(0, 80) : [i.mime_type, fmtSize(i.size_bytes)].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </button>
                {i.tags.length > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{i.tags.map((t) => "#" + t).join(" ")}</p>}
                <div className="mt-auto flex gap-1 pt-3">
                  <Button size="sm" variant="ghost" title="Copy content" onClick={() => navigator.clipboard.writeText(itemAsText(i)).then(() => toast.success("Copied"))}><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" title={i.pinned ? "Unpin" : "Pin to top"} onClick={() => act(() => togglePin(i), i.pinned ? "Unpinned" : "Pinned")}><Pin className={`h-4 w-4 ${i.pinned ? "text-primary" : ""}`} /></Button>
                  <Button size="sm" variant="ghost" title="Delete" className="ml-auto" onClick={() => confirm(`Delete "${i.title}"?`) && act(() => removeItem(i), "Deleted")}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur" onClick={() => setPreview(null)}>
          <div className="panel flex max-h-[90vh] w-full max-w-3xl flex-col p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="truncate text-lg font-semibold">{preview.item.title}</h2>
              <div className="flex gap-1">
                {preview.src && <Button size="sm" variant="outline" asChild><a href={preview.src} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-4 w-4" />Open</a></Button>}
                <Button size="sm" variant="ghost" onClick={() => setPreview(null)}><X className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-4 overflow-auto">
              {preview.item.mime_type?.startsWith("image/") && preview.src ? <img src={preview.src} alt={preview.item.title} className="mx-auto max-h-[70vh] rounded" />
                : preview.item.mime_type === "application/pdf" && preview.src ? <iframe src={preview.src} title={preview.item.title} className="h-[70vh] w-full rounded border border-border" />
                : preview.item.mime_type?.startsWith("video/") && preview.src ? <video src={preview.src} controls className="w-full rounded" />
                : preview.item.mime_type?.startsWith("audio/") && preview.src ? <audio src={preview.src} controls className="w-full" />
                : preview.item.body ? <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">{preview.item.body}</pre>
                : <p className="text-sm text-muted-foreground">{preview.item.kind === "link" ? preview.item.url : "No inline preview for this file type — use Open to download it."}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
