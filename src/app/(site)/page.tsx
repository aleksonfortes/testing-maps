import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OnboardingGuidance } from "@/components/BetaBadge";

export default function Home() {
  return (
    <>
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <section className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto text-center space-y-8 px-6 pb-12 pt-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

          <div className="mt-8">
            <OnboardingGuidance />
          </div>
        </div>
      </section>
    </>
  );
}
