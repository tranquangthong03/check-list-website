export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-rose-50 to-emerald-100 px-4 py-10 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
        {children}
      </div>
    </div>
  );
}
