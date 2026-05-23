"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { QuickLink } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type LinkForm = Omit<QuickLink, "id" | "user_id" | "created_at" | "updated_at">;

const defaultForm: LinkForm = {
  name: "",
  url: "",
  icon: "🌐",
  category: "General",
  is_favorite: false,
  sort_order: 0,
};

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function LinksClient() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LinkForm>(defaultForm);
  const [editing, setEditing] = useState<QuickLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data } = await supabase
      .from("quick_links")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setLinks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLinks();
  }, [loadLinks]);

  const submitLink = async () => {
    setError(null);
    if (!form.name.trim() || !isValidUrl(form.url)) {
      setError("Please provide a valid name and URL (http/https).");
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (editing) {
      await supabase.from("quick_links").update(form).eq("id", editing.id);
    } else {
      await supabase.from("quick_links").insert({ ...form, user_id: user.id });
    }

    setOpen(false);
    setEditing(null);
    setForm(defaultForm);
    await loadLinks();
  };

  const removeLink = async (id: string) => {
    if (!window.confirm("Delete this link?")) return;
    const supabase = createClient();
    await supabase.from("quick_links").delete().eq("id", id);
    await loadLinks();
  };

  const toggleFavorite = async (item: QuickLink) => {
    const supabase = createClient();
    await supabase
      .from("quick_links")
      .update({ is_favorite: !item.is_favorite })
      .eq("id", item.id);
    await loadLinks();
  };

  const filteredLinks = links.filter((item) =>
    item.name.toLowerCase().includes(deferredSearch.toLowerCase()),
  );

  return (
    <Card className="rounded-3xl">
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CardTitle>Quick Links</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search link..."
            className="w-[200px]"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setError(null);
                  setForm(defaultForm);
                }}
              >
                <Plus className="h-4 w-4" />
                Add link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit link" : "Create link"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  placeholder="https://example.com"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
                <Input
                  placeholder="Icon or emoji"
                  value={form.icon ?? ""}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                />
                <Input
                  placeholder="Category"
                  value={form.category ?? ""}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
                <Button onClick={submitLink}>{editing ? "Save changes" : "Create link"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">Loading links...</p> : null}
        {!loading && !filteredLinks.length ? (
          <p className="text-sm text-muted-foreground">No links found.</p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredLinks.map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xl">{item.icon || "🌐"}</p>
                <button
                  className={item.is_favorite ? "text-amber-500" : "text-muted-foreground"}
                  onClick={() => void toggleFavorite(item)}
                >
                  <Star className="h-4 w-4" fill={item.is_favorite ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="font-semibold">{item.name}</p>
              <Badge variant="secondary" className="my-2">
                {item.category || "General"}
              </Badge>
              <p className="mb-4 truncate text-sm text-muted-foreground">{item.url}</p>
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setEditing(item);
                    setError(null);
                    setForm({
                      name: item.name,
                      url: item.url,
                      icon: item.icon,
                      category: item.category,
                      is_favorite: item.is_favorite,
                      sort_order: item.sort_order,
                    });
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => void removeLink(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
