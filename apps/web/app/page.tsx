import Link from "next/link";
import { Button } from "@provato/ui";
import { ArrowRight, Shield, Zap, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="font-display text-xl font-bold">
            Provato
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/talents"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Talents
            </Link>
            <Link
              href="/projects"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Projects
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
              Verified AI Talent,{" "}
              <span className="text-primary">Proven Results</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Every specialist on Provato has passed rigorous skill verification.
              No guesswork — find the right AI expert for your project, backed
              by real assessments and verified track records.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2">
                  Find AI Talent <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/talents">
                <Button variant="outline" size="lg">
                  Browse Talents
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  icon: Shield,
                  title: "Verified Skills",
                  desc: "Every talent passes AI-powered skill assessments. Scores are transparent and time-stamped.",
                },
                {
                  icon: Zap,
                  title: "Smart Matching",
                  desc: "Semantic search powered by pgvector finds the perfect match for your project requirements.",
                },
                {
                  icon: Users,
                  title: "Secure Payments",
                  desc: "Escrow-based payments via Stripe Connect protect both clients and talent throughout every project.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Provato. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
