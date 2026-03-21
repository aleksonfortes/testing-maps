import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { BetaBadge, BetaWarning } from "@/components/BetaBadge";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <nav className="fixed top-0 w-full p-6 flex justify-between items-center glass z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight relative">
          <Logo size={28} className="rounded-lg" />
          <span>Testing Maps</span>
          <BetaBadge className="absolute -top-1 -right-10" />
        </div>
        <Link href="/workspace" className="text-sm font-medium hover:text-primary transition-colors">
          Go to Workspace
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
            href="/workspace"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex flex-col items-center gap-4 mt-8 animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
            <div className="px-6 py-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 max-w-lg text-center">
              <p className="text-sm font-semibold text-amber-500 mb-1 flex items-center justify-center gap-2">
                <span>Local-First Storage</span>
              </p>
              <p className="text-xs text-amber-500/70 leading-relaxed font-medium">
                Testing Maps saves all your work locally in your browser. Since we don&apos;t use a central database, 
                be sure to <strong>export your maps</strong> to avoid losing work if you clear your browser data.
              </p>
            </div>
            <BetaWarning />
          </div>
        </div>
      </section>
    </main>
  );
}
