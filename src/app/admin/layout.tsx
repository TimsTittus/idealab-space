import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminNav from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh bg-[#FCFBF4] text-slate-900 flex flex-col font-sans relative">
      <header className="sticky top-0 z-30 bg-slate-950 text-white shadow-md border-b border-slate-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/portal"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all active:scale-95"
              title="Return to Student Portal"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-none">
                  Admin Portal
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">
                  SJCET AICTE IDEA Lab
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 border border-slate-800">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200 truncate max-w-[140px] sm:max-w-none">
                {user?.email || "admin@sjcetpalai.ac.in"}
              </span>
              <span className="hidden sm:inline-block rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      <AdminNav />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
        {children}
      </main>
    </div>
  );
}