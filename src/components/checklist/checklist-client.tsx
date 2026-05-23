"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChecklistItem, Priority } from "@/lib/types";
import { getTodayDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterStatus = "all" | "done" | "not_done";
const priorities: Priority[] = ["low", "medium", "high"];

export function ChecklistClient() {
  const [date, setDate] = useState(getTodayDate());
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [editing, setEditing] = useState<ChecklistItem | null>(null);

  const loadItems = useCallback(async (planDate: string) => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    let query = supabase
      .from("checklist_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("plan_date", planDate)
      .order("created_at", { ascending: false });

    if (statusFilter === "done") query = query.eq("is_done", true);
    if (statusFilter === "not_done") query = query.eq("is_done", false);

    const { data } = await query;
    setItems(data ?? []);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadItems(date);
  }, [date, loadItems]);

  const submitItem = async () => {
    if (!content.trim()) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editing) {
      await supabase
        .from("checklist_items")
        .update({ content, priority })
        .eq("id", editing.id);
    } else {
      await supabase
        .from("checklist_items")
        .insert({ user_id: user.id, content, priority, plan_date: date });
    }

    setOpen(false);
    setEditing(null);
    setContent("");
    setPriority("medium");
    await loadItems(date);
  };

  const toggleDone = async (item: ChecklistItem) => {
    const supabase = createClient();
    await supabase
      .from("checklist_items")
      .update({ is_done: !item.is_done })
      .eq("id", item.id);
    await loadItems(date);
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm("Delete this checklist item?")) return;
    const supabase = createClient();
    await supabase.from("checklist_items").delete().eq("id", id);
    await loadItems(date);
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Checklist</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select value={statusFilter} onValueChange={(v: FilterStatus) => setStatusFilter(v)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="not_done">Not done</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setContent("");
                  setPriority("medium");
                }}
              >
                <Plus className="h-4 w-4" />
                Add item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit item" : "Create item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="What do you need to do?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((itemPriority) => (
                      <SelectItem key={itemPriority} value={itemPriority}>
                        {itemPriority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={submitItem}>{editing ? "Save changes" : "Create"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm text-muted-foreground">Loading checklist...</p> : null}
        {!loading && !items.length ? <p className="text-sm text-muted-foreground">No checklist items.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border p-3">
            <div className="flex items-center gap-3">
              <Checkbox checked={item.is_done} onCheckedChange={() => void toggleDone(item)} />
              <p className={item.is_done ? "text-muted-foreground line-through" : ""}>{item.content}</p>
              <Badge variant="secondary">{item.priority}</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setEditing(item);
                  setContent(item.content);
                  setPriority(item.priority);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => void deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
