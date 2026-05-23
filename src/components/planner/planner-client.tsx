"use client";

import { useCallback, useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { DailyPlan, PlanStatus, Priority } from "@/lib/types";
import { getTodayDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const statusOptions: PlanStatus[] = ["todo", "doing", "done"];
const priorityOptions: Priority[] = ["low", "medium", "high"];

type PlanForm = Omit<DailyPlan, "id" | "user_id" | "created_at" | "updated_at">;

const defaultForm = (date = getTodayDate()): PlanForm => ({
  title: "",
  description: "",
  plan_date: date,
  start_time: "08:00",
  end_time: "09:00",
  status: "todo",
  priority: "medium",
  category: "",
  color: "#22c55e",
});

export function PlannerClient() {
  const [date, setDate] = useState(getTodayDate());
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DailyPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(defaultForm());

  const loadPlans = useCallback(async (planDate: string) => {
    const supabase = createClient();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data } = await supabase
      .from("daily_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("plan_date", planDate)
      .order("start_time", { ascending: true });
    setPlans(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPlans(date);
  }, [date, loadPlans]);

  const handleSubmit = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !form.title.trim()) return;

    if (editing) {
      await supabase
        .from("daily_plans")
        .update(form)
        .eq("id", editing.id)
        .eq("user_id", user.id);
    } else {
      await supabase.from("daily_plans").insert({ ...form, user_id: user.id });
    }

    setOpen(false);
    setEditing(null);
    setForm(defaultForm(date));
    await loadPlans(date);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    if (!window.confirm("Delete this plan?")) return;
    await supabase.from("daily_plans").delete().eq("id", id);
    await loadPlans(date);
  };

  const updateStatus = async (id: string, status: PlanStatus) => {
    const supabase = createClient();
    await supabase.from("daily_plans").update({ status }).eq("id", id);
    await loadPlans(date);
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Daily Planner</CardTitle>
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                className="rounded-2xl"
                onClick={() => {
                  setEditing(null);
                  setForm(defaultForm(date));
                }}
              >
                <Plus className="h-4 w-4" />
                Add plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit plan" : "New plan"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Label>Description</Label>
                <Textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                  />
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={form.status} onValueChange={(v: PlanStatus) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={form.priority}
                    onValueChange={(v: Priority) => setForm({ ...form, priority: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Category"
                  value={form.category ?? ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <Input type="color" value={form.color ?? "#22c55e"} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                <Button onClick={handleSubmit}>{editing ? "Save changes" : "Create plan"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm text-muted-foreground">Loading plans...</p> : null}
        {!loading && !plans.length ? (
          <p className="text-sm text-muted-foreground">No plans for this day.</p>
        ) : null}
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
            style={{ borderLeftWidth: 6, borderLeftColor: plan.color ?? "#22c55e" }}
          >
            <div>
              <p className="text-sm text-muted-foreground">
                {plan.start_time.slice(0, 5)} - {plan.end_time.slice(0, 5)}
              </p>
              <p className="font-semibold">{plan.title}</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{plan.priority}</Badge>
              <Select value={plan.status} onValueChange={(v: PlanStatus) => void updateStatus(plan.id, v)}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setEditing(plan);
                  setForm({
                    title: plan.title,
                    description: plan.description,
                    plan_date: plan.plan_date,
                    start_time: plan.start_time,
                    end_time: plan.end_time,
                    status: plan.status,
                    priority: plan.priority,
                    category: plan.category,
                    color: plan.color,
                  });
                  setOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => void handleDelete(plan.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
