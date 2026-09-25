import { supabase } from "@/integrations/supabase/client";

export type LibraryItem = {
  id: string;
  kind: "file" | "link" | "note";
  title: string;
  url: string | null;
  storage_path: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  body: string | null;
  tags: string[];
  pinned: boolean;
  created_at: string;
};

const TEXT_TYPES = /^(text\/|application\/(json|xml|javascript|x-yaml|yaml|csv))/;
export const MAX_FILE = 50 * 1024 * 1024;

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Please sign in again");
  return data.user.id;
}

export async function listLibrary(): Promise<LibraryItem[]> {
  const { data, error } = await supabase.from("library_items").select("*").order("pinned", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as LibraryItem[];
}

export async function addLink(url: string, title?: string, tags: string[] = []) {
  const u = new URL(url.trim());
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http and https links are allowed");
  const { error } = await supabase.from("library_items").insert({ user_id: await uid(), kind: "link", url: u.toString(), title: (title?.trim() || u.hostname + u.pathname).slice(0, 200), tags });
  if (error) throw new Error(error.message);
}

export async function addNote(title: string, body: string, tags: string[] = []) {
  const { error } = await supabase.from("library_items").insert({ user_id: await uid(), kind: "note", title: title.trim().slice(0, 200) || "Untitled note", body: body.slice(0, 200000), tags });
  if (error) throw new Error(error.message);
}

export async function addFile(file: File, tags: string[] = []) {
  if (file.size > MAX_FILE) throw new Error(`${file.name} is larger than 50 MB`);
  const id = await uid();
  const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
  const path = `${id}/${crypto.randomUUID()}-${safe}`;
  const up = await supabase.storage.from("library").upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (up.error) throw new Error(up.error.message);
  const body = TEXT_TYPES.test(file.type) || /\.(md|txt|csv|json|ya?ml)$/i.test(file.name) ? (await file.text()).slice(0, 200000) : null;
  const { error } = await supabase.from("library_items").insert({
    user_id: id, kind: "file", title: file.name.slice(0, 200), storage_path: path, mime_type: file.type || null, size_bytes: file.size, body, tags,
  });
  if (error) {
    await supabase.storage.from("library").remove([path]);
    throw new Error(error.message);
  }
}

export async function removeItem(item: LibraryItem) {
  if (item.storage_path) await supabase.storage.from("library").remove([item.storage_path]);
  const { error } = await supabase.from("library_items").delete().eq("id", item.id);
  if (error) throw new Error(error.message);
}

export async function togglePin(item: LibraryItem) {
  const { error } = await supabase.from("library_items").update({ pinned: !item.pinned }).eq("id", item.id);
  if (error) throw new Error(error.message);
}

export async function signedUrl(item: LibraryItem) {
  if (!item.storage_path) return item.url;
  const { data, error } = await supabase.storage.from("library").createSignedUrl(item.storage_path, 600);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

/** Text that gets injected into a form field. */
export function itemAsText(i: LibraryItem) {
  if (i.kind === "link") return `${i.title}\n${i.url}`;
  if (i.body) return i.body;
  return `${i.title} (file in library)`;
}

export function fmtSize(n: number | null) {
  if (!n) return "";
  return n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}
