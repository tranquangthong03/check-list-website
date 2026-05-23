"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { DailyPlan, PlanStatus, Priority } from "@/lib/types";
import { getTodayDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DailyPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(defaultForm());

  useEffect(() => {
    const stored = localStorage.getItem("plans");
    const allPlans: DailyPlan[] = stored ? JSON.parse(stored) : [];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlans(
      allPlans
        .filter((item) => item.plan_date === date)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    );
  }, [date]);

  const syncPlans = (updated: DailyPlan[]) => {
    localStorage.setItem("plans", JSON.stringify(updated));
    setPlans(
      updated
        .filter((item) => item.plan_date === date)
        .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    );
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    const stored = localStorage.getItem("plans");
    const allPlans: DailyPlan[] = stored ? JSON.parse(stored) : [];

    if (editing) {
      const updated = allPlans.map((item) =>
        item.id === editing.id
          ? { ...item, ...form, updated_at: new Date().toISOString() }
          : item,
      );
      syncPlans(updated);
    } else {
      const now = new Date().toISOString();
      const newPlan: DailyPlan = {
        ...form,
        id: crypto.randomUUID(),
        user_id: "local-user",
        created_at: now,
        updated_at: now,
      };
      syncPlans([...allPlans, newPlan]);
    }

    setOpen(false);
    setEditing(null);
    setForm(defaultForm(date));
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa kế hoạch này?")) return;
    const stored = localStorage.getItem("plans");
    const allPlans: DailyPlan[] = stored ? JSON.parse(stored) : [];
    syncPlans(allPlans.filter((item) => item.id !== id));
  };

  const updateStatus = (id: string, status: PlanStatus) => {
    const stored = localStorage.getItem("plans");
    const allPlans: DailyPlan[] = stored ? JSON.parse(stored) : [];
    syncPlans(allPlans.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Kế hoạch ngày</CardTitle>
        <div className="flex gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <span className={cn(buttonVariants(), "rounded-2xl")} onClick={() => setForm(defaultForm(date))}>
                <Plus className="h-4 w-4" />
                Thêm kế hoạch
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Sửa kế hoạch" : "Tạo kế hoạch mới"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <Label>Tiêu đề</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Label>Mô tả</Label>
                <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                  <Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: (v ?? "todo") as PlanStatus })}>
                    <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
                    <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: (v ?? "medium") as Priority })}>
                    <SelectTrigger><SelectValue placeholder="Ưu tiên" /></SelectTrigger>
                    <SelectContent>{priorityOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Input placeholder="Danh mục" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                <Input type="color" value={form.color ?? "#22c55e"} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                <Button onClick={handleSubmit}>{editing ? "Lưu thay đổi" : "Tạo kế hoạch"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!plans.length ? <p className="text-sm text-muted-foreground">Ngày này chưa có kế hoạch.</p> : null}
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between" style={{ borderLeftWidth: 6, borderLeftColor: plan.color ?? "#22c55e" }}>
            <div>
              <p className="text-sm text-muted-foreground">{plan.start_time.slice(0, 5)} - {plan.end_time.slice(0, 5)}</p>
              <p className="font-semibold">{plan.title}</p>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{plan.priority}</Badge>
              <Select value={plan.status} onValueChange={(v) => updateStatus(plan.id, (v ?? "todo") as PlanStatus)}>
                <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="icon" variant="outline" onClick={() => { setEditing(plan); setForm({ title: plan.title, description: plan.description, plan_date: plan.plan_date, start_time: plan.start_time, end_time: plan.end_time, status: plan.status, priority: plan.priority, category: plan.category, color: plan.color }); setOpen(true); }}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => handleDelete(plan.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
