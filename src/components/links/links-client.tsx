"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { ExternalLink, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { QuickLink } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type LinkForm = Omit<QuickLink, "id" | "user_id" | "created_at" | "updated_at">;
const defaultForm: LinkForm = { name: "", url: "", icon: "🌐", category: "Chung", is_favorite: false, sort_order: 0 };

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch { return false; }
}

export function LinksClient() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LinkForm>(defaultForm);
  const [editing, setEditing] = useState<QuickLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const stored = localStorage.getItem("links");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLinks(stored ? JSON.parse(stored) : []);
  }, []);

  const saveLinks = (items: QuickLink[]) => {
    localStorage.setItem("links", JSON.stringify(items));
    setLinks(items);
  };

  const submitLink = () => {
    setError(null);
    if (!form.name.trim() || !isValidUrl(form.url)) {
      setError("Vui lòng nhập tên và URL hợp lệ (http/https).");
      return;
    }
    if (editing) {
      saveLinks(links.map((item) => item.id === editing.id ? { ...item, ...form, updated_at: new Date().toISOString() } : item));
    } else {
      const now = new Date().toISOString();
      saveLinks([...links, { ...form, id: crypto.randomUUID(), user_id: "local-user", created_at: now, updated_at: now }]);
    }
    setOpen(false);
    setEditing(null);
    setForm(defaultForm);
  };

  const removeLink = (id: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa liên kết này?")) return;
    saveLinks(links.filter((item) => item.id !== id));
  };

  const toggleFavorite = (item: QuickLink) => {
    saveLinks(links.map((it) => (it.id === item.id ? { ...it, is_favorite: !it.is_favorite } : it)));
  };

  const filteredLinks = useMemo(
    () => links.filter((item) => item.name.toLowerCase().includes(deferredSearch.toLowerCase())),
    [deferredSearch, links],
  );

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Liên kết nhanh</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm liên kết..." className="w-[200px]" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <span className={buttonVariants()} onClick={() => { setEditing(null); setError(null); setForm(defaultForm); }}>
                <Plus className="h-4 w-4" />Thêm liên kết
              </span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Sửa liên kết" : "Tạo liên kết mới"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input placeholder="https://example.com" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                <Input placeholder="Icon hoặc emoji" value={form.icon ?? ""} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
                <Input placeholder="Danh mục" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
                <Button onClick={submitLink}>{editing ? "Lưu thay đổi" : "Tạo liên kết"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredLinks.length ? <p className="text-sm text-muted-foreground">Không tìm thấy liên kết.</p> : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredLinks.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xl">{item.icon || "🌐"}</p>
                <button className={item.is_favorite ? "text-amber-500" : "text-muted-foreground"} onClick={() => toggleFavorite(item)}>
                  <Star className="h-4 w-4" fill={item.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="font-semibold">{item.name}</p>
              <Badge variant="secondary" className="my-2">{item.category || "Chung"}</Badge>
              <p className="mb-4 truncate text-sm text-muted-foreground">{item.url}</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}><ExternalLink className="h-4 w-4" />Mở</Button>
                <Button size="icon" variant="outline" onClick={() => { setEditing(item); setError(null); setForm({ name: item.name, url: item.url, icon: item.icon, category: item.category, is_favorite: item.is_favorite, sort_order: item.sort_order }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => removeLink(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
