"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lightbulb, Eye, EyeOff, Loader2 } from "lucide-react";
import { formatAuthError } from "@/lib/formatError";

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          hd: "sjcetpalai.ac.in",
        },
      },
    });

    if (authError) {
      setError(formatAuthError(authError));
      setGoogleLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(formatAuthError(authError));
      setLoading(false);
      return;
    }

    const {
      data: { user: authedUser },
    } = await supabase.auth.getUser();

    if (authedUser?.app_metadata?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/");
    }
    router.refresh();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400 text-slate-950 shadow-md">
          <Lightbulb className="h-8 w-8 text-slate-950" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">
          SJCET IDEA Lab
        </h1>
        <p className="mt-1 text-xs font-bold text-stone-500">
          Innovate · Design · Engineer · Achieve
        </p>
      </div>

      <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
        <h2 className="mb-1 text-lg font-black text-slate-950 text-center">
          Sign in to your account
        </h2>
        <p className="mb-6 text-xs font-semibold text-stone-500 text-center">
          Use your @sjcetpalai.ac.in Google Workspace account
        </p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 py-3.5 px-4 text-xs font-black text-slate-950 shadow-xs transition-all hover:bg-stone-100 active:scale-[0.98] disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-950" />
          ) : (
            <>
              <GoogleGlyph />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="relative my-6 text-center text-xs">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-stone-400 uppercase tracking-widest text-[10px] font-black">
            Or sign in with email
          </span>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-black text-slate-950 uppercase tracking-wider"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="yourname@sjcetpalai.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-black text-slate-950 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pr-11 text-xs font-bold text-slate-900 placeholder:text-stone-400 outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-900"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3.5 text-xs font-black text-amber-400 shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            ) : (
              "Sign In with Email"
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs font-bold text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-black text-amber-700 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}