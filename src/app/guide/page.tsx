import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Map,
  FileText,
  Download,
  Upload,
  Keyboard,
  MousePointer,
  Undo2,
  Shield,
  Flag,
  ShieldAlert,
  CheckCircle2,
  Circle,
  AlertCircle,
  Layers,
  Cpu,
  Smartphone,
  Code,
  Eye,
  Zap,
  GitBranch,
  ChevronRight,
  Palette,
  Search,
  Target,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { BetaBadge } from "@/components/BetaBadge";

export const metadata: Metadata = {
  title: "Guide — Testing Maps",
  description:
    "Learn how to use Testing Maps to create visual mind maps for your testing scenarios. Step-by-step onboarding guide.",
};

/* -------------------------------------------------------------------------- */
/* Tiny UI components used only in this page                                  */
/* -------------------------------------------------------------------------- */

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}

function StepNumber({ n }: { n: number }) {
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-black text-lg shrink-0 shadow-lg">
      {n}
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = "primary",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: string;
}) {
  const colors: Record<string, string> = {
    primary: "bg-primary/5 border-primary/10 hover:border-primary/30",
    green: "bg-green-500/5 border-green-500/10 hover:border-green-500/30",
    orange: "bg-orange-500/5 border-orange-500/10 hover:border-orange-500/30",
    blue: "bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30",
    red: "bg-red-500/5 border-red-500/10 hover:border-red-500/30",
    purple: "bg-purple-500/5 border-purple-500/10 hover:border-purple-500/30",
  };
  const iconColors: Record<string, string> = {
    primary: "text-primary",
    green: "text-green-500",
    orange: "text-orange-500",
    blue: "text-blue-500",
    red: "text-red-500",
    purple: "text-purple-500",
  };
  return (
    <div className={`rounded-3xl border-2 p-6 transition-all duration-300 ${colors[accent]}`}>
      <Icon className={`w-7 h-7 mb-4 ${iconColors[accent]}`} />
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-secondary border border-border text-xs font-mono font-bold shadow-sm">
      {children}
    </kbd>
  );
}

function MockNode({
  label,
  status,
  type,
  priority,
  risk,
  compact,
}: {
  label: string;
  status: "verified" | "untested" | "failed";
  type: string;
  priority?: string;
  risk?: string;
  compact?: boolean;
}) {
  const statusStyles = {
    verified: { bg: "bg-green-500/10", color: "text-green-500", Icon: CheckCircle2 },
    untested: { bg: "bg-muted/10", color: "text-muted-foreground", Icon: Circle },
    failed: { bg: "bg-red-500/10", color: "text-red-500", Icon: AlertCircle },
  };
  const typeIcons: Record<string, React.ElementType> = {
    e2e: Cpu,
    unit: Code,
    integration: Layers,
    manual: Smartphone,
  };
  const s = statusStyles[status];
  const TypeIcon = typeIcons[type] ?? Smartphone;

  return (
    <div className="rounded-2xl border-2 border-border bg-card/80 backdrop-blur-sm shadow-lg p-4 w-full max-w-[260px]">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${s.bg}`}>
          <s.Icon className={`w-4 h-4 ${s.color}`} />
        </div>
        <h4 className="font-bold text-sm">{label}</h4>
      </div>
      {!compact && (
        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 w-fit">
            <TypeIcon className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{type}</span>
          </div>
          {priority && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit ${
                priority === "critical"
                  ? "bg-red-500/10 text-red-600"
                  : priority === "high"
                  ? "bg-orange-500/10 text-orange-600"
                  : priority === "medium"
                  ? "bg-yellow-500/10 text-yellow-600"
                  : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              <Flag className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{priority}</span>
            </div>
          )}
          {risk && (
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit ${
                risk === "high"
                  ? "bg-red-500/10 text-red-600"
                  : risk === "medium"
                  ? "bg-orange-500/10 text-orange-600"
                  : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              <ShieldAlert className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Risk: {risk}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MockEdge() {
  return (
    <svg width="60" height="2" className="text-muted-foreground/30 shrink-0">
      <line x1="0" y1="1" x2="60" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ------------------------------------------------------------------ */}
      {/* Navigation                                                         */}
      {/* ------------------------------------------------------------------ */}
      <nav className="sticky top-0 w-full p-6 flex justify-between items-center glass z-50 h-20 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight relative">
          <Logo size={28} className="rounded-lg" />
          <span>Testing Maps</span>
          <BetaBadge className="absolute -top-1 -right-10" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/guide" className="text-sm font-bold text-primary">
            Guide
          </Link>
          <Link
            href="/workspace"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-all"
          >
            Open Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center space-y-8">
          <Badge className="bg-primary/10 text-primary border border-primary/20">
            <Map className="w-3.5 h-3.5" /> Complete Guide
          </Badge>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">
            Map your tests.
            <br />
            <span className="text-muted-foreground">Ship with confidence.</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Testing Maps transforms your testing strategy into a visual mind map.
            Organize scenarios hierarchically, track coverage, set priorities — all in your browser.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a href="#quickstart" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all">
              Quick Start <ChevronRight className="w-4 h-4" />
            </a>
            <a href="#features" className="flex items-center gap-2 border-2 border-border px-6 py-3 rounded-full font-semibold hover:bg-secondary transition-all">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* What is Testing Maps?                                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Target className="w-3.5 h-3.5" /> What is it?
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">
              A visual layer for your test strategy
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stop managing tests in spreadsheets and wikis. Testing Maps gives you an interactive
              mind map where every node is a testing scenario with metadata, status tracking, and
              priority levels.
            </p>
          </div>

          {/* Live mock: mini mind map */}
          <div className="relative bg-card/50 border-2 border-border rounded-3xl p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,var(--background)_70%)] pointer-events-none z-10" />
            <div className="flex items-start gap-4 flex-wrap justify-center relative">
              {/* Root */}
              <div className="flex flex-col items-center gap-4">
                <MockNode label="Auth Module" status="untested" type="manual" compact />
                <div className="h-8 w-px bg-border" />
                <div className="flex gap-4">
                  {/* Branch 1 */}
                  <div className="flex flex-col items-center gap-3">
                    <MockNode label="Login Flow" status="verified" type="e2e" compact />
                    <div className="h-6 w-px bg-border" />
                    <div className="flex gap-3">
                      <MockNode label="Valid Creds" status="verified" type="e2e" compact />
                      <MockNode label="Invalid Creds" status="failed" type="unit" compact />
                    </div>
                  </div>
                  {/* Branch 2 */}
                  <div className="flex flex-col items-center gap-3">
                    <MockNode label="Registration" status="untested" type="manual" compact />
                    <div className="h-6 w-px bg-border" />
                    <MockNode label="Email Verify" status="untested" type="integration" compact />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Quick Start                                                        */}
      {/* ------------------------------------------------------------------ */}
      <section id="quickstart" className="py-24 border-t border-border/50 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">
              <Zap className="w-3.5 h-3.5" /> Quick Start
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Up and running in 3 steps</h2>
            <p className="text-lg text-muted-foreground">
              From zero to a complete test map in under a minute.
            </p>
          </div>

          {/* Step 1 */}
          <div className="flex gap-6 items-start">
            <StepNumber n={1} />
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold">Create a new map</h3>
              <p className="text-muted-foreground leading-relaxed">
                Click <strong>&quot;Get Started&quot;</strong> on the landing page or <strong>&quot;New Map&quot;</strong> from
                the map dropdown in the workspace. Give it a name and your blank canvas is ready.
              </p>
              <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Map className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Map Dropdown</p>
                    <p className="text-xs text-muted-foreground">Top-left corner of the workspace</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold">Options:</span>
                  <Badge className="bg-secondary text-foreground">New Map</Badge>
                  <Badge className="bg-secondary text-foreground">Import</Badge>
                  <Badge className="bg-secondary text-foreground">Rename</Badge>
                  <Badge className="bg-secondary text-foreground">Duplicate</Badge>
                  <Badge className="bg-secondary text-foreground">Delete</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start">
            <StepNumber n={2} />
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold">Add testing scenarios</h3>
              <p className="text-muted-foreground leading-relaxed">
                Select any node and press <KeyboardKey>Tab</KeyboardKey> to add a child scenario.
                Double-click a node label to rename it. Build your hierarchy as deep as you need —
                categories, sub-categories, and leaf test cases.
              </p>
              <div className="bg-card border-2 border-border rounded-2xl p-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <MockNode label="Auth Module" status="untested" type="manual" compact />
                  <div className="text-muted-foreground text-xs font-mono flex items-center gap-1">
                    <KeyboardKey>Tab</KeyboardKey>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <MockNode label="New Scenario" status="untested" type="manual" compact />
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start">
            <StepNumber n={3} />
            <div className="flex-1 space-y-4">
              <h3 className="text-2xl font-bold">Enrich with metadata</h3>
              <p className="text-muted-foreground leading-relaxed">
                Click a node to open the <strong>Edit Modal</strong>. Set the status, test type, priority,
                risk level, instructions, expected results, and link to your automation code.
              </p>
              <div className="bg-card border-2 border-border rounded-2xl p-6 grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</p>
                  <div className="flex gap-2">
                    <Badge className="bg-muted/10 text-muted-foreground border border-border">
                      <Circle className="w-3 h-3" /> Untested
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </Badge>
                    <Badge className="bg-red-500/10 text-red-600 border border-red-500/20">
                      <AlertCircle className="w-3 h-3" /> Failed
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Test Type</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-secondary text-foreground"><Smartphone className="w-3 h-3" /> Manual</Badge>
                    <Badge className="bg-secondary text-foreground"><Code className="w-3 h-3" /> Unit</Badge>
                    <Badge className="bg-secondary text-foreground"><Layers className="w-3 h-3" /> Integration</Badge>
                    <Badge className="bg-secondary text-foreground"><Cpu className="w-3 h-3" /> E2E</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Priority</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-red-500/10 text-red-600 border border-red-500/20"><Flag className="w-3 h-3" /> Critical</Badge>
                    <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20"><Flag className="w-3 h-3" /> High</Badge>
                    <Badge className="bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"><Flag className="w-3 h-3" /> Medium</Badge>
                    <Badge className="bg-secondary text-muted-foreground"><Flag className="w-3 h-3" /> Low</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Risk</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-red-500/10 text-red-600 border border-red-500/20"><ShieldAlert className="w-3 h-3" /> High</Badge>
                    <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20"><ShieldAlert className="w-3 h-3" /> Medium</Badge>
                    <Badge className="bg-secondary text-muted-foreground"><ShieldAlert className="w-3 h-3" /> Low</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Full Node Anatomy                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Search className="w-3.5 h-3.5" /> Deep Dive
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Anatomy of a scenario node</h2>
            <p className="text-lg text-muted-foreground">
              Every node can hold rich metadata. Toggle what you see with the filter bar.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <MockNode
                label="Login Flow"
                status="verified"
                type="e2e"
                priority="critical"
                risk="high"
              />
              {/* Annotation pointers */}
              <div className="absolute -right-48 top-2 flex items-center gap-2">
                <div className="w-8 h-px bg-green-500" />
                <span className="text-xs font-semibold text-green-600 whitespace-nowrap">✓ Status indicator</span>
              </div>
              <div className="absolute -right-40 top-[72px] flex items-center gap-2">
                <div className="w-8 h-px bg-blue-500" />
                <span className="text-xs font-semibold text-blue-600 whitespace-nowrap">Test type badge</span>
              </div>
              <div className="absolute -right-48 top-[100px] flex items-center gap-2">
                <div className="w-8 h-px bg-orange-500" />
                <span className="text-xs font-semibold text-orange-600 whitespace-nowrap">🚩 Priority level</span>
              </div>
              <div className="absolute -right-44 top-[128px] flex items-center gap-2">
                <div className="w-8 h-px bg-red-500" />
                <span className="text-xs font-semibold text-red-600 whitespace-nowrap">🛡️ Risk level</span>
              </div>
              <div className="absolute -left-44 top-2 flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground/60 whitespace-nowrap">Scenario name</span>
                <div className="w-8 h-px bg-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Features Grid                                                      */}
      {/* ------------------------------------------------------------------ */}
      <section id="features" className="py-24 border-t border-border/50 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20">
              <Layers className="w-3.5 h-3.5" /> Features
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Everything you need</h2>
            <p className="text-lg text-muted-foreground">
              Built for QA engineers, test leads, and developers who care about quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Upload}
              title="Markdown Import"
              description="Paste or upload a markdown file and instantly generate a full mind map with statuses, types, and hierarchy."
              accent="blue"
            />
            <FeatureCard
              icon={Download}
              title="Markdown Export"
              description="Export your mind map back to structured markdown. Copy to clipboard or download as a .md file."
              accent="green"
            />
            <FeatureCard
              icon={GitBranch}
              title="Visual Mind Map"
              description="Interactive canvas powered by React Flow. Pan, zoom, drag nodes, and see relationships with animated floating edges."
              accent="purple"
            />
            <FeatureCard
              icon={Flag}
              title="Priority & Risk"
              description="Assign priority (critical/high/medium/low) and risk levels to every scenario. Color-coded badges make hotspots obvious."
              accent="orange"
            />
            <FeatureCard
              icon={Eye}
              title="Smart Filters"
              description="Toggle what metadata is visible: test types, instructions, expected results, code refs, priority, and risk — all from the bottom HUD."
              accent="primary"
            />
            <FeatureCard
              icon={Undo2}
              title="Undo / Redo"
              description="Full 50-step undo/redo history. Made a mistake? Press ⌘Z to go back. Every add, delete, rename, and move is tracked."
              accent="red"
            />
            <FeatureCard
              icon={Keyboard}
              title="Keyboard-First"
              description="Tab to add children, Backspace to delete, ⌘Z/⌘⇧Z for undo/redo, ? for shortcuts modal. Power users rejoice."
              accent="primary"
            />
            <FeatureCard
              icon={MousePointer}
              title="Drag Reparenting"
              description="Drag a node over another to make it a child. The drop target highlights in blue. Release to reparent instantly."
              accent="blue"
            />
            <FeatureCard
              icon={Shield}
              title="Local-First & Private"
              description="All data stays in your browser's IndexedDB. No server, no account, no tracking. Export to back up your work."
              accent="green"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Keyboard Shortcuts                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              <Keyboard className="w-3.5 h-3.5" /> Shortcuts
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Keyboard shortcuts</h2>
            <p className="text-lg text-muted-foreground">
              Press <KeyboardKey>?</KeyboardKey> anywhere in the workspace to see all shortcuts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { keys: ["Tab"], action: "Add child node" },
              { keys: ["Backspace"], action: "Delete selected node(s)" },
              { keys: ["⌘", "Z"], action: "Undo" },
              { keys: ["⌘", "⇧", "Z"], action: "Redo" },
              { keys: ["⌘", "E"], action: "Export to markdown" },
              { keys: ["⌘", "I"], action: "Import markdown" },
              { keys: ["Double-click"], action: "Rename node inline" },
              { keys: ["?"], action: "Show shortcuts modal" },
            ].map(({ keys, action }) => (
              <div
                key={action}
                className="flex items-center justify-between p-4 rounded-2xl bg-card border-2 border-border hover:border-primary/20 transition-colors"
              >
                <span className="text-sm font-medium">{action}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k, i) => (
                    <span key={`${action}-${i}`}>
                      {i > 0 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                      <KeyboardKey>{k}</KeyboardKey>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Import / Export                                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <FileText className="w-3.5 h-3.5" /> Markdown
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Import & Export</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your test maps are portable. Import from markdown, export back to markdown.
              The format is human-readable and git-friendly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Markdown format */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Markdown Format
              </h3>
              <div className="bg-card border-2 border-border rounded-2xl p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                <pre className="text-muted-foreground">{`# My Test Plan

- **Auth Module** [UNTESTED] (manual)
  - *Priority:* critical
  - *Risk:* high
  - **Login Flow** [VERIFIED] (e2e)
    - *Instructions:* Navigate to /login
    - *Expected:* Form renders
    - *Code:* \`e2e/auth.spec.ts\`
    - *Priority:* high
    - *Risk:* medium
  - **Registration** [FAILED] (unit)
    - *Priority:* medium`}</pre>
              </div>
            </div>

            {/* Visual result */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Map className="w-5 h-5 text-green-500" />
                Visual Result
              </h3>
              <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <MockNode label="Auth Module" status="untested" type="manual" priority="critical" risk="high" />
                  <div className="flex gap-8 items-start">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-4 w-px bg-border" />
                      <MockNode label="Login Flow" status="verified" type="e2e" priority="high" risk="medium" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-4 w-px bg-border" />
                      <MockNode label="Registration" status="failed" type="unit" priority="medium" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border-2 border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">
              <strong>Pro tip:</strong> We include a real example file you can download and import to see all features in action.
            </p>
            <a
              href="/testing-scenarios-example.md"
              download
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Example File
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Filter Bar                                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">
              <Eye className="w-3.5 h-3.5" /> Filters
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Control what you see</h2>
            <p className="text-lg text-muted-foreground">
              The bottom filter bar lets you toggle metadata visibility across all nodes at once.
            </p>
          </div>

          {/* Mock filter bar */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 p-2 bg-card border-2 border-border rounded-full shadow-xl">
              {[
                { icon: Target, label: "Expectations", active: false },
                { icon: FileText, label: "Instructions", active: false },
                { icon: Layers, label: "Test Types", active: true },
                { icon: Code, label: "Code Links", active: false },
                { icon: Flag, label: "Priority", active: true },
                { icon: ShieldAlert, label: "Risk", active: true },
              ].map(({ icon: I, label, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    active
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <I className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-3">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filters OFF</p>
              <MockNode label="Login Flow" status="verified" type="e2e" compact />
              <p className="text-xs text-muted-foreground">Clean, minimal — just the name and status.</p>
            </div>
            <div className="bg-card border-2 border-border rounded-2xl p-6 space-y-3">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Filters ON</p>
              <MockNode label="Login Flow" status="verified" type="e2e" priority="critical" risk="high" />
              <p className="text-xs text-muted-foreground">Rich view — test type, priority, and risk badges visible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Coverage HUD                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-green-500/10 text-green-600 border border-green-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Coverage
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Track your progress</h2>
            <p className="text-lg text-muted-foreground">
              The top bar shows real-time coverage across your entire map.
            </p>
          </div>

          {/* Mock coverage HUD */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-card border-2 border-border rounded-full shadow-xl text-sm font-semibold">
              <span className="text-muted-foreground">49 scenarios</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> 17
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" /> 32
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> 0
              </span>
            </div>
          </div>

          <div className="text-center text-muted-foreground">
            <p>
              <span className="text-green-600 font-bold">Green</span> = verified, <span className="font-bold">Gray</span> = untested, <span className="text-red-600 font-bold">Red</span> = failed.
              As you change node statuses, the counter updates instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Workflow Tips                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20">
              <Palette className="w-3.5 h-3.5" /> Pro Tips
            </Badge>
            <h2 className="text-4xl font-black tracking-tight">Get the most out of Testing Maps</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "Start from markdown, iterate visually",
                desc: "Write your initial test plan in markdown (it's faster for bulk creation), import it, then use the visual canvas to reorganize, re-prioritize, and add metadata.",
              },
              {
                title: "Use sub-categories for large suites",
                desc: "Don't put 50 scenarios under one parent. Group them: Auth → Login → Valid Creds / Invalid Creds. This creates a wider, more navigable tree.",
              },
              {
                title: "Mark critical paths with Priority flags",
                desc: "Set 'critical' priority on your most important scenarios. When the filter is on, red badges make them impossible to miss during test reviews.",
              },
              {
                title: "Export regularly for backup",
                desc: "Data lives in your browser. Export your maps to .md files and commit them to your repo. They're human-readable and diff-friendly.",
              },
              {
                title: "Collapse branches to focus",
                desc: "Click the ▸ button below any parent node to collapse its children. Great for focusing on one area during review sessions.",
              },
              {
                title: "Use the layout toggle for different views",
                desc: "Switch between horizontal (LR) and vertical (TB) layouts in the toolbar. Horizontal works best for deep trees, vertical for wide ones.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border-2 border-border hover:border-primary/20 bg-card transition-colors">
                <ChevronRight className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-24 border-t border-border/50 bg-primary/5">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
            Ready to map your tests?
          </h2>
          <p className="text-lg text-muted-foreground">
            No sign-up. No server. Just open the workspace and start building.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/workspace"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all group"
            >
              Open Workspace
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="/testing-scenarios-example.md"
              download
              className="flex items-center gap-2 border-2 border-border px-8 py-4 rounded-full text-lg font-semibold hover:bg-secondary transition-all"
            >
              <Download className="w-5 h-5" />
              Download Example
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                             */}
      {/* ------------------------------------------------------------------ */}
      <footer className="py-8 border-t border-border/50">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo size={20} className="rounded" />
            <span className="font-semibold text-foreground">Testing Maps</span>
            <span>— Open-source, local-first test mapping.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/guide" className="hover:text-foreground transition-colors">Guide</Link>
            <Link href="/workspace" className="hover:text-foreground transition-colors">Workspace</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
