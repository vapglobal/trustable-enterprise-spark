import { createFileRoute, Link } from "@tanstack/react-router";
import { GrowthOrganism } from "@/components/trustable/GrowthOrganism";
import { ConfidentialFooter, ProofBadge, Wordmark } from "@/components/trustable/Chrome";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { pageMeta } from "@/lib/site";

export const Route = createFileRoute("/growth")({
  head: () =>
    pageMeta({
      title: "Builder Growth & Adoption Organism — Trustable",
      description:
        "Explore Trustable builder levels, measurable value, organization growth, and the interactive enterprise incentive model.",
      path: "/growth",
      index: false,
    }),
  component: PublicGrowthPage,
});

function PublicGrowthPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Wordmark />
        <div className="flex items-center gap-3">
          <Link
            to="/architecture"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:inline"
          >
            Architecture
          </Link>
          <Link
            to="/flow"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:inline"
          >
            Mobile App Creator
          </Link>
          <Link
            to="/motion-preview"
            className="hidden text-xs font-medium text-muted-foreground hover:text-foreground sm:inline"
          >
            Motion Story
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link to="/">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-6 pb-20">
        <div className="max-w-3xl">
          <p className="eyebrow">Enterprise Adoption Organism · Interactive Model</p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">
            Trustable Builder Growth Organism
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Start with one useful solution. Prove the minutes. Grow the people, bridges, capability,
            and enterprise value—under customer governance at every level.
          </p>
        </div>

        <GrowthOrganism
          liveMinutes={1420}
          liveRuns={24}
          livePeople={6}
          liveValue={2840}
        />
      </main>

      <ConfidentialFooter />
    </div>
  );
}
