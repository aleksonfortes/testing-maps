import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Download,
  Flag,
  ShieldAlert,
  CheckCircle2,
  Circle,
  AlertCircle,
  Layers,
  Cpu,
  Smartphone,
  Code,
  FileText,
  Target,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { BetaBadge } from "@/components/BetaBadge";

export const metadata: Metadata = {
  title: "How to Use — Testing Maps",
  description:
    "Learn how to use Testing Maps in 5 minutes. Step-by-step guide to creating visual mind maps for your testing scenarios.",
};

/* -------------------------------------------------------------------------- */
/* Shared tiny components                                                     */
/* -------------------------------------------------------------------------- */

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
  selected,
  className = "",
}: {
  label: string;
  status: "verified" | "untested" | "failed";
  type: string;
  priority?: string;
  risk?: string;
  selected?: boolean;
  className?: string;
}) {
  const statusStyles = {
    verified: { bg: "bg-green-500/10", color: "text-green-500", Icon: CheckCircle2 },
    untested: { bg: "bg-muted/10", color: "text-muted-foreground", Icon: Circle },
    failed: { bg: "bg-red-500/10", color: "text-red-500", Icon: AlertCircle },
  };
  const typeIcons: Record<string, React.ElementType> = { e2e: Cpu, unit: Code, integration: Layers, manual: Smartphone };
  const s = statusStyles[status];
  const TypeIcon = typeIcons[type] ?? Smartphone;

  return (
    <div className={`rounded-2xl border-2 bg-card/80 shadow-md p-4 w-full max-w-[240px] ${selected ? "border-primary ring-4 ring-primary/10" : "border-border"} ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-xl ${s.bg}`}>
          <s.Icon className={`w-4 h-4 ${s.color}`} />
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 text-[10px] font-bold uppercase text-muted-foreground">
          <TypeIcon className="w-3 h-3" /> {type}
        </span>
        {priority && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
            priority === "critical" ? "bg-red-500/10 text-red-600" :
            priority === "high" ? "bg-orange-500/10 text-orange-600" :
            priority === "medium" ? "bg-yellow-500/10 text-yellow-600" :
            "bg-secondary/50 text-muted-foreground"
          }`}>
            <Flag className="w-3 h-3" /> {priority}
          </span>
        )}
        {risk && (
          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
            risk === "high" ? "bg-red-500/10 text-red-600" :
            risk === "medium" ? "bg-orange-500/10 text-orange-600" :
            "bg-secondary/50 text-muted-foreground"
          }`}>
            <ShieldAlert className="w-3 h-3" /> risk: {risk}
          </span>
        )}
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="grid md:grid-cols-[auto_1fr] gap-6">
      <div className="flex items-start gap-4 md:block">
        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-black text-base flex items-center justify-center shrink-0">
          {n}
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="space-y-4 text-[15px] text-muted-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 w-full px-6 py-4 flex justify-between items-center glass z-50 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight relative">
          <Logo size={24} className="rounded-lg" />
          <span>Testing Maps</span>
          <BetaBadge className="absolute -top-1 -right-10" />
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/guide" className="text-sm font-semibold text-primary">Guide</Link>
          <Link href="/workspace" className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all">
            Open Workspace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-20">
        {/* Header */}
        <header className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight">How to use Testing Maps</h1>
          <p className="text-muted-foreground">
            Learn the basics in 5 minutes. Everything runs locally in your browser — no account needed.
          </p>
        </header>

        {/* ----- Step 1: Create a map ------------------------------------ */}
        <Step n={1} title="Create a map">
          <p>
            Open the <strong>workspace</strong> and click the map dropdown (top-left). Choose <strong>New Map</strong> and type a name.
          </p>
          <p>
            You can also import an existing map from markdown — click <strong>Import</strong> in the same dropdown, paste your markdown, and choose &quot;Create New Map&quot; or &quot;Replace Current Map&quot;.
          </p>
          <div className="bg-secondary/30 border border-border rounded-xl p-4 text-sm">
            <p className="font-semibold text-foreground mb-1">Try it now:</p>
            <a href="/testing-scenarios-example.md" download className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline">
              <Download className="w-3.5 h-3.5" /> Download our example file
            </a>
            <span className="text-muted-foreground">, then import it.</span>
          </div>
        </Step>

        {/* ----- Step 2: Add & organize nodes ---------------------------- */}
        <Step n={2} title="Add and organize scenarios">
          <p>Select a node and press <KeyboardKey>Tab</KeyboardKey> to add a child. Double-click any label to rename it.</p>

          <div className="flex items-center gap-3 py-2">
            <MockNode label="Auth Module" status="untested" type="manual" selected />
            <div className="flex flex-col items-center text-xs text-muted-foreground">
              <KeyboardKey>Tab</KeyboardKey>
              <ArrowRight className="w-3 h-3 mt-1" />
            </div>
            <MockNode label="New Scenario" status="untested" type="manual" />
          </div>

          <p>Each node is a <strong>test scenario</strong> — a single thing to verify. Group related scenarios under parent nodes to keep your map organized.</p>
          <p>To <strong>reparent</strong> a node, drag it onto another node (it highlights blue). To <strong>delete</strong>, select and press <KeyboardKey>Backspace</KeyboardKey>.</p>
        </Step>

        {/* ----- Step 3: Set metadata ------------------------------------ */}
        <Step n={3} title="Set status, priority, and risk">
          <p>Click a node to open the <strong>Edit panel</strong>. From there you can set:</p>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Status</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-500" /> Verified</div>
                <div className="flex items-center gap-2 text-sm"><Circle className="w-4 h-4 text-muted-foreground" /> Untested</div>
                <div className="flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4 text-red-500" /> Failed</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Test Type</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm"><Smartphone className="w-4 h-4 text-muted-foreground" /> Manual</div>
                <div className="flex items-center gap-2 text-sm"><Code className="w-4 h-4 text-muted-foreground" /> Unit</div>
                <div className="flex items-center gap-2 text-sm"><Layers className="w-4 h-4 text-muted-foreground" /> Integration</div>
                <div className="flex items-center gap-2 text-sm"><Cpu className="w-4 h-4 text-muted-foreground" /> E2E</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Priority</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Medium</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-gray-300" /> Low</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2">Risk</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-red-500" /> High</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-orange-500" /> Medium</div>
                <div className="flex items-center gap-2 text-sm"><span className="w-2 h-2 rounded-full bg-gray-300" /> Low</div>
              </div>
            </div>
          </div>

          <p>You can also add <strong>instructions</strong>, <strong>expected results</strong>, and a <strong>code reference</strong> (link to your test file).</p>

          <p>Here&apos;s what a fully annotated node looks like:</p>
          <div className="flex justify-center py-2">
            <MockNode label="Login Flow" status="verified" type="e2e" priority="critical" risk="high" />
          </div>
        </Step>

        {/* ----- Step 4: Use filters ------------------------------------- */}
        <Step n={4} title="Toggle what you see">
          <p>The <strong>bottom bar</strong> has filter toggles. Click them to show or hide metadata on all nodes at once:</p>

          <div className="flex flex-wrap gap-2 py-2">
            {[
              { icon: Target, label: "Expectations", on: false },
              { icon: FileText, label: "Instructions", on: false },
              { icon: Layers, label: "Test Types", on: true },
              { icon: Code, label: "Code Links", on: false },
              { icon: Flag, label: "Priority", on: true },
              { icon: ShieldAlert, label: "Risk", on: false },
            ].map(({ icon: I, label, on }) => (
              <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                on ? "bg-secondary text-foreground border-border" : "text-muted-foreground border-transparent"
              }`}>
                <I className="w-3.5 h-3.5" /> {label}
              </span>
            ))}
          </div>

          <p>The <strong>top bar</strong> shows real-time coverage: how many scenarios are verified, untested, or failed.</p>
        </Step>

        {/* ----- Step 5: Import / Export ---------------------------------- */}
        <Step n={5} title="Import and export markdown">
          <p>Your maps are stored in your browser. To back up or share, export to markdown.</p>
          <p><KeyboardKey>⌘</KeyboardKey> + <KeyboardKey>E</KeyboardKey> to export. <KeyboardKey>⌘</KeyboardKey> + <KeyboardKey>I</KeyboardKey> to import.</p>

          <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 pt-2">Markdown format:</p>
          <div className="bg-card border border-border rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <pre className="text-muted-foreground">{`# My Test Plan

- **Auth Module** [UNTESTED] (manual)
  - *Priority:* critical
  - *Risk:* high
  - **Login Flow** [VERIFIED] (e2e)
    - *Instructions:* Navigate to /login
    - *Expected:* Form renders
    - *Code:* \`e2e/auth.spec.ts\`
    - *Priority:* high
  - **Registration** [FAILED] (unit)`}</pre>
          </div>
          <p>Each indentation level becomes a parent→child relationship in the mind map.</p>
        </Step>

        {/* ----- Keyboard shortcuts -------------------------------------- */}
        <section>
          <h2 className="text-xl font-bold mb-4">Keyboard shortcuts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Press <KeyboardKey>?</KeyboardKey> in the workspace to see all shortcuts.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { keys: ["Tab"], action: "Add child node" },
              { keys: ["Backspace"], action: "Delete node" },
              { keys: ["⌘", "Z"], action: "Undo" },
              { keys: ["⌘", "⇧", "Z"], action: "Redo" },
              { keys: ["⌘", "E"], action: "Export" },
              { keys: ["⌘", "I"], action: "Import" },
              { keys: ["Double-click"], action: "Rename" },
              { keys: ["?"], action: "Shortcuts" },
            ].map(({ keys, action }) => (
              <div key={action} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border text-sm">
                <span>{action}</span>
                <span className="flex items-center gap-0.5">
                  {keys.map((k, i) => (
                    <span key={`${action}-${i}`}>
                      {i > 0 && <span className="text-muted-foreground text-[10px] mx-0.5">+</span>}
                      <KeyboardKey>{k}</KeyboardKey>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ----- Tips ---------------------------------------------------- */}
        <section>
          <h2 className="text-xl font-bold mb-4">Tips</h2>
          <ul className="space-y-3 text-[15px] text-muted-foreground">
            <li><strong className="text-foreground">Start from markdown.</strong> Write your test plan in a .md file first (it&apos;s faster for bulk creation), then import it.</li>
            <li><strong className="text-foreground">Use sub-categories.</strong> Don&apos;t put 50 scenarios under one parent. Group them into 3–5 children per node.</li>
            <li><strong className="text-foreground">Collapse branches.</strong> Click the ▸ button below any parent to hide its children. Useful during reviews.</li>
            <li><strong className="text-foreground">Export regularly.</strong> Data is in your browser only. Export to .md and commit to your repo for backup.</li>
            <li><strong className="text-foreground">Toggle layout direction.</strong> Use the toolbar to switch between horizontal (LR) and vertical (TB) layouts.</li>
          </ul>
        </section>

        {/* ----- CTA ----------------------------------------------------- */}
        <section className="text-center py-8 border-t border-border/50">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-all"
          >
            Open Workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
