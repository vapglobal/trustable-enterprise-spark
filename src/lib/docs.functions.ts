import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Allowlist of confidential documents stored in the private "trustable-docs"
// bucket. Nothing here is ever served from the public web folder.
const DOCS = new Set([
  "CHRISTOPHER_WARE_MASTER_RESUME_2026_OASA.pdf",
  "CHRISTOPHER_WARE_MASTER_RESUME_2026_OASA.md",
  "ENGINEWARE_ORGANIC_API_SURFACE_PRESENTATION.pdf",
  "ENGINEWARE_ORGANIC_API_SURFACE_PRESENTATION.pptx",
  "ENGINEWARE_ORGANIC_API_SURFACE_MASTER_DOSSIER.md",
  "TRUSTABLE_TECHNICAL_PRESENTATION.pdf",
  "TRUSTABLE_TECHNICAL_PRESENTATION.pptx",
  "TRUSTABLE_TECHNICAL_PRESENTATION.html",
  "TRUSTABLE_ENTERPRISE_TECHNICAL_MANUAL.md",
  "LOVABLE_ENTERPRISE_SOLUTIONS_BRIEFING.md",
  "CHRISTOPHER_WARE_LINKEDIN_OASA_OVERHAUL.html",
  "CHRISTOPHER_WARE_LINKEDIN_OASA_OVERHAUL_2026.md",
  "MATT_NORTON_AOAS_EXECUTIVE_EMAIL.html",
  "MATT_NORTON_AOAS_EXECUTIVE_EMAIL_2026-09-25.md",
]);

/**
 * Returns a short-lived signed URL for a confidential document.
 * Requires an authenticated session; unknown names are rejected.
 */
export const getDocUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ name: z.string() }).parse(data))
  .handler(async ({ data }) => {
    if (!DOCS.has(data.name)) throw new Error("Unknown document");
    // Caller is already verified by requireSupabaseAuth; admin client only
    // signs a 5-minute URL and never returns document contents directly.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("trustable-docs")
      .createSignedUrl(data.name, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
