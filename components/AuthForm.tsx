"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    searchParams.get("error"),
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const supabase = createClient();

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setNotice("Check your email to confirm your account, then sign in.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBusy(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="w-full max-w-md">
      <h1 className="hero-title text-4xl mb-2">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="body-text text-white/50 mb-8">
        {isSignup
          ? "Pick a template and publish your portfolio in minutes."
          : "Sign in to manage your portfolio sites."}
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 body-text">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 body-text">
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 body-text">
        {isSignup && (
          <div>
            <label htmlFor="fullName" className="block text-sm text-white/70 mb-2">
              Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm text-white/70 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
            placeholder="you@studio.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm text-white/70 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-black border border-white/20 rounded-lg focus:outline-none focus:border-white/40"
            placeholder="At least 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {busy ? "One moment…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-white/10" />
        <span className="body-text text-xs text-white/40">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full py-3 bg-white/10 border border-white/20 rounded-lg body-text hover:bg-white/20 transition-colors"
      >
        Continue with Google
      </button>

      <p className="body-text text-sm text-white/50 mt-8 text-center">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-white underline underline-offset-4">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-white underline underline-offset-4">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
