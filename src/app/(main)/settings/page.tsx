import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Please login to manage settings.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Full name:</span>{" "}
            {user.user_metadata.full_name ?? "Not set"}
          </p>
          <p>
            <span className="font-medium">User ID:</span> {user.id}
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark mode.
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Session</p>
              <p className="text-sm text-muted-foreground">Sign out from this device.</p>
            </div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
