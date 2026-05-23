"use client";

import { useEffect, useState } from "react";
import { CheckCheck, ClipboardList, Link2, ListTodo } from "lucide-react";
import { formatDateLabel, getTodayDate } from "@/lib/date";
import { ChecklistItem, DailyPlan, QuickLink } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [links, setLinks] = useState<QuickLink[]>([]);

  useEffect(() => {
    const storedPlans = localStorage.getItem("plans");
    const storedChecklist = localStorage.getItem("checklist");
    const storedLinks = localStorage.getItem("links");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlans(storedPlans ? JSON.parse(storedPlans) : []);
    setChecklist(storedChecklist ? JSON.parse(storedChecklist) : []);
    setLinks(storedLinks ? JSON.parse(storedLinks) : []);
  }, []);

  const today = getTodayDate();
  const todayPlans = plans.filter((item) => item.plan_date === today);
  const todayChecklist = checklist.filter((item) => item.plan_date === today);
  const doneChecklist = todayChecklist.filter((item) => item.is_done).length;
  const favoriteLinks = links.filter((item) => item.is_favorite).slice(0, 4);
  const progress = todayChecklist.length
    ? Math.round((doneChecklist / todayChecklist.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="text-3xl font-bold">Xin chào, bạn.</h1>
        <p className="text-muted-foreground">{formatDateLabel(new Date())}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: ListTodo, title: "Tiến độ hôm nay", value: `${progress}%` },
          { icon: ClipboardList, title: "Tổng kế hoạch", value: String(todayPlans.length) },
          { icon: CheckCheck, title: "Việc đã hoàn thành", value: String(doneChecklist) },
          { icon: Link2, title: "Link yêu thích", value: String(favoriteLinks.length) },
        ].map(({ icon: Icon, title, value }) => (
          <Card key={title} className="rounded-3xl">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-semibold">{value}</p>
              {title === "Tiến độ hôm nay" ? <Progress className="mt-3 h-2" value={progress} /> : null}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Kế hoạch hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {todayPlans.length ? (
              todayPlans.slice(0, 5).map((plan) => (
                <div key={plan.id} className="rounded-2xl border p-3">
                  <p className="font-medium">{plan.title}</p>
                  <p className="text-muted-foreground">
                    {plan.start_time.slice(0, 5)} - {plan.end_time.slice(0, 5)} · {plan.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Hôm nay chưa có kế hoạch.</p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Liên kết yêu thích</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {favoriteLinks.length ? (
              favoriteLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border p-3 hover:bg-accent"
                >
                  <p className="font-medium">{link.name}</p>
                  <p className="text-muted-foreground">{link.category || "Chung"}</p>
                </a>
              ))
            ) : (
              <p className="text-muted-foreground">Chưa có liên kết yêu thích.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
