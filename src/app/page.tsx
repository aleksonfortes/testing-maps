import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BetaWarning } from "@/components/BetaBadge";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    redirect("/workspace");
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <nav className="fixed top-0 w-full p-6 flex justify-between items-center glass z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Logo size={28} className="rounded-lg" />
          <span>Testing Maps</span>
        </div>
        <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">
          Sign In
        </Link>
      </nav>

      <section className="max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
          Testing in the <br />
          <span className="text-muted-foreground">age of AI.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The definitive tool for mapping testing scenarios. Bridge the gap between high-level
          requirements and low-level code with visual mind maps.
        </p>

        <div className="flex flex-col items-center gap-6 pt-8">
          <Link
            href="/auth"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <BetaWarning className="mt-8" />
        </div>
      </section>
    </main>
  );
}
