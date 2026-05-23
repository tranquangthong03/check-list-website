"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    setLoading(true);
    await supabase.auth.signOut();
    startTransition(() => {
      router.replace("/auth/login");
      router.refresh();
    });
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={loading}>
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
}
