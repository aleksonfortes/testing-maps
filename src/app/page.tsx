import Link from "next/link";
import { ArrowRight, Map, Zap, Users, Code2 } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <nav className="fixed top-0 w-full p-6 flex justify-between items-center glass z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Map className="w-6 h-6" />
          <span>Testing Maps</span>
        </div>
        <div className="flex gap-4">
          <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
          <Link href="/workspace" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
            Try Demo
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
          Testing in the <br />
          <span className="text-muted-foreground">age of AI.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The definitive tool for mapping testing scenarios. Bridge the gap between high-level requirements and low-level code with real-time collaborative mind maps.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/workspace" className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all group">
            Launch Workspace
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:bg-secondary/80 transition-all">
            Explore Features
          </Link>
        </div>
      </section>

      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-32">
        <FeatureCard 
          icon={<Users className="w-6 h-6" />}
          title="Collaborative"
          description="Real-time multi-user editing with live cursors and instant conflict resolution."
        />
        <FeatureCard 
          icon={<Zap className="w-6 h-6" />}
          title="AI-Native"
          description="Import AI-generated testing schemas automatically to visualize your testing map instantly."
        />
        <FeatureCard 
          icon={<Code2 className="w-6 h-6" />}
          title="IDE Integrated"
          description="Link scenarios directly to code files. Verify quality where it matters most."
        />
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-secondary/50 border border-border hover:border-primary/20 transition-all group">
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-bold mb-2 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
