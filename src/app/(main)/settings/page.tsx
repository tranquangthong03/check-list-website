import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const hasSupabaseConfig =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasSupabaseConfig) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Thiếu biến Supabase. Vui lòng cấu hình <code>.env.local</code>.
        </CardContent>
      </Card>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Vui lòng đăng nhập để quản lý cài đặt.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p>
            <span className="font-medium">Họ và tên:</span>{" "}
            {user.user_metadata.full_name ?? "Chưa cập nhật"}
          </p>
          <p>
            <span className="font-medium">Mã người dùng:</span> {user.id}
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Tùy chọn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Giao diện</p>
              <p className="text-sm text-muted-foreground">
                Chuyển giữa chế độ sáng và tối.
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Phiên đăng nhập</p>
              <p className="text-sm text-muted-foreground">Đăng xuất khỏi thiết bị này.</p>
            </div>
            <LogoutButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
