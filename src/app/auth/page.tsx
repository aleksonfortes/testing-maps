"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

// Google icon as inline SVG
function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

type AuthMode = "signin" | "signup" | "forgot";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const router = useRouter();

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setInfo("Check your email for a password reset link.");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (mode === "signup") {
        const { error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;
        setInfo("Check your email for the confirmation link!");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/workspace");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred during authentication";
      if (message.includes("Invalid login credentials") || message.includes("User not found")) {
        setError("Invalid email or password.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8 glass p-10 rounded-3xl border border-border/50 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size={48} className="rounded-2xl shadow-xl mb-2" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Testing Maps</h1>
          <p className="text-muted-foreground italic">Connect your testing thoughts.</p>
        </div>

        {/* ─── Forgot Password flow ─── */}
        {mode === "forgot" ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter your email and we&apos;ll send you a reset link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="text-sm font-medium ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full shrink-0" />
                  {error}
                </div>
              )}
              {info && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm p-4 rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </button>
            </form>

            <button
              onClick={() => switchMode("signin")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mx-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </button>
          </div>
        ) : (
          /* ─── Sign In / Sign Up flow ─── */
          <div className="space-y-5">
            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border border-border bg-secondary/50 hover:bg-secondary py-3.5 rounded-2xl font-medium transition-all active:scale-[0.98]"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground shrink-0">or continue with email</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Email/password form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="auth-email" className="text-sm font-medium ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1 mr-1">
                  <label htmlFor="auth-password" className="text-sm font-medium">Password</label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input
                    id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-secondary/50 border border-border rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full shrink-0" />
                  {error}
                </div>
              )}
              {info && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-700 text-sm p-4 rounded-xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0" />
                  {info}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
