import { useState } from "react";
import { Copy, Download, FileJson, FileText, MoreHorizontal, Presentation, Share2, Sparkles, Table2 } from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import PptxGenJS from "pptxgenjs";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CONFIDENTIAL_NOTICE } from "@/lib/tenant";

type Props = { title: string; data: unknown; className?: string };
const text = (data: unknown) => typeof data === "string" ? data : JSON.stringify(data, null, 2);
const safe = (value: string) => value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "report";
function download(blob: Blob, name: string) { const href = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = href; a.download = name; a.click(); URL.revokeObjectURL(href); }
function csv(data: unknown) {
  const rows = Array.isArray(data) ? data : [data];
  if (!rows.length || rows.some((row) => !row || typeof row !== "object" || Array.isArray(row))) return "content\n\"" + text(data).replaceAll('"', '""') + "\"";
  const keys = [...new Set(rows.flatMap((row) => Object.keys(row as object)))];
  const cell = (value: unknown) => "\"" + String(value ?? "").replaceAll('"', '""').replace(/^[=+\-@]/, "'$&") + "\"";
  return [keys.map(cell).join(","), ...rows.map((row) => keys.map((key) => cell((row as Record<string, unknown>)[key])).join(","))].join("\n");
}

export function ReportActions({ title, data, className }: Props) {
  const [working, setWorking] = useState(false); const body = CONFIDENTIAL_NOTICE + "\n\n" + title + "\n\n" + text(data); const name = safe(title);
  const run = async (fn: () => Promise<void> | void) => { setWorking(true); try { await fn(); } finally { setWorking(false); } };
  const assistant = () => window.dispatchEvent(new CustomEvent("trustable:assistant", { detail: { prompt: "Analyze this report and identify key risks, anomalies, and prioritized next actions:\n\n" + body.slice(0, 30000) } }));
  return <DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline" size="sm" disabled={working} className={className} title="Report actions"><MoreHorizontal className="mr-2 h-4 w-4" />Actions</Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>Export and work with report</DropdownMenuLabel>
    <DropdownMenuItem onClick={() => run(() => navigator.clipboard.writeText(body))}><Copy className="mr-2 h-4 w-4" />Copy</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(() => download(new Blob([body], { type: "text/plain" }), name + ".txt"))}><FileText className="mr-2 h-4 w-4" />Text</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(() => download(new Blob(["# " + title + "\n\n> " + CONFIDENTIAL_NOTICE + "\n\nJSON\n" + text(data)], { type: "text/markdown" }), name + ".md"))}><FileText className="mr-2 h-4 w-4" />Markdown</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(() => download(new Blob([JSON.stringify({ confidentiality: CONFIDENTIAL_NOTICE, title, data }, null, 2)], { type: "application/json" }), name + ".json"))}><FileJson className="mr-2 h-4 w-4" />JSON</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(() => download(new Blob([CONFIDENTIAL_NOTICE + "\n" + csv(data)], { type: "text/csv" }), name + ".csv"))}><Table2 className="mr-2 h-4 w-4" />CSV</DropdownMenuItem><DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => run(() => { const pdf = new jsPDF(); const lines = pdf.splitTextToSize(body, 175) as string[]; let y = 15; lines.forEach((line) => { if (y > 280) { pdf.addPage(); y = 15; } pdf.text(line, 15, y); y += 6; }); pdf.save(name + ".pdf"); })}><Download className="mr-2 h-4 w-4" />PDF</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(async () => { const pptx = new PptxGenJS(); pptx.author = "Trustable"; pptx.subject = CONFIDENTIAL_NOTICE; const slide = pptx.addSlide(); slide.addText(title, { x: .6, y: .5, w: 8.8, h: .4, fontSize: 24, bold: true }); slide.addText(CONFIDENTIAL_NOTICE, { x: .6, y: 1, w: 8.8, h: .3, fontSize: 8, color: "666666" }); slide.addText(text(data).slice(0, 4500), { x: .6, y: 1.5, w: 8.8, h: 5.3, fontSize: 10 }); await pptx.writeFile({ fileName: name + ".pptx" }); })}><Presentation className="mr-2 h-4 w-4" />PowerPoint</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(async () => { const doc = new Document({ sections: [{ children: [new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 32 })] }), new Paragraph(CONFIDENTIAL_NOTICE), ...body.split("\n").map((line) => new Paragraph(line))] }] }); download(await Packer.toBlob(doc), name + ".docx"); })}><FileText className="mr-2 h-4 w-4" />Word</DropdownMenuItem><DropdownMenuSeparator />
    <DropdownMenuItem onClick={assistant}><Sparkles className="mr-2 h-4 w-4" />Analyze with AI</DropdownMenuItem>
    <DropdownMenuItem onClick={() => run(async () => { if (navigator.share) await navigator.share({ title, text: body }); else await navigator.clipboard.writeText(body); })}><Share2 className="mr-2 h-4 w-4" />Share</DropdownMenuItem>
  </DropdownMenuContent></DropdownMenu>;
}