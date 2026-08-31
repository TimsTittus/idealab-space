export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white text-slate-900 font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      <main className="flex-1">{children}</main>
    </div>
  );
}