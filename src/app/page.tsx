import Link from "next/link";
import { ArrowRight, CalendarClock, CheckSquare, Link2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-emerald-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 md:px-8">
        <section className="space-y-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Personal productivity app
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Check List Website
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Manage checklist, daily plans, and frequently used websites in one
            clean dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild className="rounded-2xl">
              <Link href="/dashboard">
                Go to app
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: CheckSquare,
              title: "Checklist",
              text: "Track tasks and progress each day.",
            },
            {
              icon: CalendarClock,
              title: "Daily Planner",
              text: "Plan work by timeline and priority.",
            },
            {
              icon: Link2,
              title: "Quick Links",
              text: "Save and open important websites quickly.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title} className="rounded-3xl border-0 bg-card/80 shadow-sm">
              <CardContent className="space-y-3 p-6">
                <div className="w-fit rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
