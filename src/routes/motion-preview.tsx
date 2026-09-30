import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MotionStory } from "@/components/trustable/MotionStory";
import { ConfidentialFooter, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/motion-preview")({
  head: () => pageMeta({
    title: "Motion Story Preview — Trustable",
    description: "Private review surface for proposed Trustable motion stories.",
    path: "/motion-preview",
    index: false,
  }),
  component: MotionPreview,
});

function MotionPreview() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Wordmark />
        <Button asChild size="sm" variant="outline"><Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-6 pb-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Private proposal · Not added to existing surfaces</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Motion-story concept review</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Three proposed visual narratives for individual approval. Nothing here has been placed on the homepage, Architecture, or the signed-in app.</p>
        </div>
        <MotionStory />
      </main>
      <ConfidentialFooter />
    </div>
  );
}