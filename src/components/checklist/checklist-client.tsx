"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ChecklistItem, Priority } from "@/lib/types";
import { getTodayDate } from "@/lib/date";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterStatus = "all" | "done" | "not_done";
const priorities: Priority[] = ["low", "medium", "high"];

export function ChecklistClient() {
  const [date, setDate] = useState(getTodayDate());
  const [allItems, setAllItems] = useState<ChecklistItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [editing, setEditing] = useState<ChecklistItem | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("checklist");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllItems(stored ? JSON.parse(stored) : []);
  }, []);

  const saveItems = (items: ChecklistItem[]) => {
    localStorage.setItem("checklist", JSON.stringify(items));
    setAllItems(items);
  };

  const items = useMemo(() => {
    const byDate = allItems.filter((item) => item.plan_date === date);
    if (statusFilter === "done") return byDate.filter((item) => item.is_done);
    if (statusFilter === "not_done") return byDate.filter((item) => !item.is_done);
    return byDate;
  }, [allItems, date, statusFilter]);

  const submitItem = () => {
    if (!content.trim()) return;
    if (editing) {
      saveItems(
        allItems.map((item) =>
          item.id === editing.id
            ? { ...item, content, priority, updated_at: new Date().toISOString() }
            : item,
        ),
      );
    } else {
      const now = new Date().toISOString();
      const item: ChecklistItem = {
        id: crypto.randomUUID(),
        user_id: "local-user",
        content,
        plan_date: date,
        is_done: false,
        priority,
        created_at: now,
        updated_at: now,
      };
      saveItems([...allItems, item]);
    }
    setOpen(false);
    setEditing(null);
    setContent("");
    setPriority("medium");
  };

  const toggleDone = (item: ChecklistItem) => {
    saveItems(allItems.map((it) => (it.id === item.id ? { ...it, is_done: !it.is_done } : it)));
  };

  const deleteItem = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa mục này?")) return;
    saveItems(allItems.filter((item) => item.id !== id));
  };

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Việc cần làm</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter((v ?? "all") as FilterStatus)}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="done">Đã xong</SelectItem>
              <SelectItem value="not_done">Chưa xong</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <span className={buttonVariants()} onClick={() => { setEditing(null); setContent(""); setPriority("medium"); }}>
                <Plus className="h-4 w-4" />Thêm việc
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Sửa việc" : "Tạo việc mới"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Bạn cần làm gì?" value={content} onChange={(e) => setContent(e.target.value)} />
                <Select value={priority} onValueChange={(v) => setPriority((v ?? "medium") as Priority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{priorities.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={submitItem}>{editing ? "Lưu thay đổi" : "Tạo mới"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!items.length ? <p className="text-sm text-muted-foreground">Chưa có mục nào.</p> : null}
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border p-3">
            <div className="flex items-center gap-3">
              <Checkbox checked={item.is_done} onCheckedChange={() => toggleDone(item)} />
              <p className={item.is_done ? "text-muted-foreground line-through" : ""}>{item.content}</p>
              <Badge variant="secondary">{item.priority}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => { setEditing(item); setContent(item.content); setPriority(item.priority); setOpen(true); }}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
