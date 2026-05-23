"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "register";

type AuthCardProps = {
  mode: AuthMode;
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError("Thiếu biến Supabase trong .env.local");
      setLoading(false);
      return;
    }

    if (!email.trim() || !password.trim() || (isRegister && !fullName.trim())) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      setLoading(false);
      return;
    }

    const action = isRegister
      ? supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
      : supabase.auth.signInWithPassword({ email, password });

    const { error: authError } = await action;

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  };

  return (
    <Card className="w-full rounded-3xl border-0 bg-card/90 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isRegister ? "Tạo tài khoản" : "Chào mừng quay lại"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Nhập họ và tên"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" className="w-full rounded-2xl" disabled={loading}>
            {loading
              ? "Đang xử lý..."
              : isRegister
                ? "Tạo tài khoản"
                : "Đăng nhập"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
          <Link
            href={isRegister ? "/auth/login" : "/auth/register"}
            className="font-semibold text-primary"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
