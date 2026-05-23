import { CheckCheck, ClipboardList, Link2, ListTodo } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDateLabel, getTodayDate } from "@/lib/date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Please login to view dashboard.
        </CardContent>
      </Card>
    );
  }

  const today = getTodayDate();

  const [{ count: planCount }, { count: doneChecklist }, { count: totalChecklist }] =
    await Promise.all([
      supabase
        .from("daily_plans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("plan_date", today),
      supabase
        .from("checklist_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("plan_date", today)
        .eq("is_done", true),
      supabase
        .from("checklist_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("plan_date", today),
    ]);

  const { data: todayPlansRaw } = await supabase
    .from("daily_plans")
    .select("id,title,start_time,end_time,status,priority")
    .eq("user_id", user.id)
    .eq("plan_date", today)
    .order("start_time", { ascending: true })
    .limit(5);

  const { data: favoriteLinksRaw } = await supabase
    .from("quick_links")
    .select("id,name,url,category")
    .eq("user_id", user.id)
    .eq("is_favorite", true)
    .order("sort_order", { ascending: true })
    .limit(4);

  const todayPlans = (todayPlansRaw ?? []) as {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    status: string;
    priority: string;
  }[];

  const favoriteLinks = (favoriteLinksRaw ?? []) as {
    id: string;
    name: string;
    url: string;
    category: string | null;
  }[];

  const progress = totalChecklist
    ? Math.round(((doneChecklist ?? 0) / totalChecklist) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-bold">Hi, {user.user_metadata.full_name ?? "there"}.</h1>
        <p className="text-muted-foreground">{formatDateLabel(new Date())}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: ListTodo, title: "Today Progress", value: `${progress}%` },
          { icon: ClipboardList, title: "Total Plans", value: String(planCount ?? 0) },
          { icon: CheckCheck, title: "Completed Checklist", value: String(doneChecklist ?? 0) },
          { icon: Link2, title: "Favorite Links", value: String(favoriteLinks?.length ?? 0) },
        ].map(({ icon: Icon, title, value }) => (
          <Card key={title} className="rounded-3xl">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-semibold">{value}</p>
              {title === "Today Progress" ? <Progress className="mt-3 h-2" value={progress} /> : null}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Today plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {todayPlans?.length ? (
              todayPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border p-3">
                  <p className="font-medium">{plan.title}</p>
                  <p className="text-muted-foreground">
                    {plan.start_time.slice(0, 5)} - {plan.end_time.slice(0, 5)} · {plan.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No plan for today.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Favorite quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {favoriteLinks?.length ? (
              favoriteLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border p-3 hover:bg-accent"
                >
                  <p className="font-medium">{link.name}</p>
                  <p className="text-muted-foreground">{link.category || "General"}</p>
                </a>
              ))
            ) : (
              <p className="text-muted-foreground">No favorite links yet.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
