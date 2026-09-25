// Single source of truth for public SEO copy. Keep in sync with the landing page hero.
export const SITE = {
  name: "Trustable",
  url: "https://trustable-enterprise-solutions.lovable.app",
  title: "Trustable — Enterprise Solutions & Trust Layer for Lovable",
  tagline: "Enterprise solutions & trust layer, powered by Lovable's creative energy.",
  description:
    "Enterprise solutions & trust layer, powered by Lovable's creative energy. From idea to impact — secure, compliant, and ready for the real world.",
  keywords:
    "Trustable, enterprise trust layer, Lovable enterprise, secure AI app builder, role-based access control, tenant isolation, tamper-evident audit log, AI governance, compliance, security posture",
  author: "Christopher Ware, EngineWare.ai",
} as const;

export function pageMeta(opts: { title: string; description: string; path: string; index?: boolean }) {
  const url = SITE.url + opts.path;
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
      ...(opts.index === false ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
