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
  ChevronRight,
  Plus,
  Undo2,
  Redo2,
  Maximize,
  ChevronsDownUp,
  ChevronsUpDown,
  Code2,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { BetaBadge } from "@/components/BetaBadge";

export const metadata: Metadata = {
  title: "How to Use — Testing Maps",
  description:
    "Learn how to use Testing Maps in 5 minutes. Step-by-step guide to creating visual mind maps for your testing scenarios.",
};

/* -------------------------------------------------------------------------- */
/* Shared components                                                          */
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
  collapsed,
  childCount,
}: {
  label: string;
  status: "verified" | "untested" | "failed";
  type: string;
  priority?: string;
  risk?: string;
  selected?: boolean;
  collapsed?: boolean;
  childCount?: number;
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
    <div className="relative">
      <div className={`rounded-2xl border-2 bg-card/80 shadow-md p-4 w-full max-w-[240px] ${selected ? "border-primary ring-4 ring-primary/10" : "border-border"}`}>
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
      {childCount != null && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-card border-2 border-border shadow text-[10px] font-bold text-muted-foreground">
          <ChevronRight className={`w-3 h-3 ${collapsed ? "" : "rotate-90"}`} />
          {collapsed && <span className="text-primary">+{childCount}</span>}
        </div>
      )}
    </div>
  );
}

function Step({ n, title, id, children }: { n: number; title: string; id: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-24 grid md:grid-cols-[auto_1fr] gap-6">
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

function Callout({ type = "info", children }: { type?: "info" | "warning"; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl p-4 text-sm flex gap-3 ${
      type === "warning"
        ? "bg-orange-500/5 border border-orange-500/20"
        : "bg-secondary/30 border border-border"
    }`}>
      {type === "warning" && <TriangleAlert className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />}
      <div>{children}</div>
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
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center glass z-50 h-20">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight relative">
          <Logo size={28} className="rounded-lg" />
          <span>Testing Maps</span>
          <BetaBadge className="absolute -top-1 -right-10" />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/guide" className="text-sm font-medium text-primary transition-colors">Guide</Link>
          <Link href="/workspace" className="text-sm font-medium hover:text-primary transition-colors">
            Go to Workspace
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pt-28 pb-16 space-y-20">
        {/* ---- Header --------------------------------------------------- */}
        <header className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight">How to use Testing Maps</h1>
          <p className="text-muted-foreground">
            Testing Maps is a visual mind map for organizing test scenarios. Each node is a scenario with a status, type, priority, and risk level. Everything runs locally in your browser — no account, no server.
          </p>

          {/* Table of contents */}
          <nav className="pt-4 border-t border-border/50">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">On this page</p>
            <ol className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {[
                { id: "create", label: "Create a map" },
                { id: "add", label: "Add scenarios" },
                { id: "edit", label: "Edit a scenario" },
                { id: "navigate", label: "Navigate the canvas" },
                { id: "filters", label: "Filters & coverage" },
                { id: "export", label: "Export & backup" },
                { id: "shortcuts", label: "Keyboard shortcuts" },
              ].map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </header>

        {/* ---- Step 1: Create a map ------------------------------------- */}
        <Step n={1} title="Create a map" id="create">
          <p>
            Open the <Link href="/workspace" className="text-primary font-medium hover:underline">workspace</Link> and click the <strong>map dropdown</strong> (top-left corner, next to the logo). Choose <strong>New Map</strong> and type a name.
          </p>
          <p>
            To start from an existing plan, choose <strong>Import</strong> instead. Paste your markdown or use our example file:
          </p>
          <Callout>
            <p className="font-semibold text-foreground mb-1">Try it now:</p>
            <a href="/testing-scenarios-example.md" download className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline">
              <Download className="w-3.5 h-3.5" /> Download the example file
            </a>
            <span className="text-muted-foreground">, then Import → paste → &quot;Create New Map&quot;.</span>
          </Callout>
          <p>
            From the same dropdown you can also <strong>Rename</strong>, <strong>Duplicate</strong>, or <strong>Delete</strong> maps.
          </p>
        </Step>

        {/* ---- Step 2: Add scenarios ------------------------------------ */}
        <Step n={2} title="Add scenarios" id="add">
          <p>Select any node and press <KeyboardKey>Tab</KeyboardKey> to create a child scenario. Double-click a label to rename it inline.</p>

          <div className="flex items-center gap-3 py-2">
            <MockNode label="Auth" status="untested" type="manual" selected />
            <div className="flex flex-col items-center text-xs text-muted-foreground">
              <KeyboardKey>Tab</KeyboardKey>
              <ArrowRight className="w-3 h-3 mt-1" />
            </div>
            <MockNode label="New Scenario" status="untested" type="manual" />
          </div>

          <p>Each node is a <strong>test scenario</strong> — a single thing to verify. Group related scenarios under parent nodes to keep your map organized.</p>

          <p>You can also use the <strong><Plus className="w-3.5 h-3.5 inline" /> Add Scenario</strong> button in the bottom-right toolbar.</p>

          <p>To <strong>move</strong> a scenario to a different parent, drag it onto another node — the target highlights blue. To <strong>delete</strong>, select it and press <KeyboardKey>Backspace</KeyboardKey>.</p>
        </Step>

        {/* ---- Step 3: Edit a scenario ---------------------------------- */}
        <Step n={3} title="Edit a scenario" id="edit">
          <p><strong>Double-click</strong> any node to open the Edit panel. From there you set everything about the scenario:</p>

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

          <p>The panel also has fields for <strong>Instructions</strong> (what to test), <strong>Expected Results</strong> (what should happen), and a <strong>Code Reference</strong> (link to your test file).</p>

          <p>Here&apos;s what a fully annotated node looks like with filters on:</p>
          <div className="flex justify-center py-2">
            <MockNode label="Login Flow" status="verified" type="e2e" priority="critical" risk="high" />
          </div>

          <p className="text-sm">You can also quick-edit from the <strong>⋯ menu</strong> on hover: Edit Name, Duplicate, or Delete.</p>
        </Step>

        {/* ---- Step 4: Navigate the canvas ------------------------------- */}
        <Step n={4} title="Navigate the canvas" id="navigate">
          <p>The workspace is an infinite canvas. <strong>Scroll</strong> to zoom, <strong>click and drag</strong> the background to pan.</p>

          <p className="font-semibold text-foreground">Toolbar (bottom-right)</p>
          <div className="flex flex-wrap gap-2 py-1">
            {[
              { icon: Plus, label: "Add Scenario" },
              { icon: Undo2, label: "Undo" },
              { icon: Redo2, label: "Redo" },
              { icon: Maximize, label: "Fit to Screen" },
              { icon: ChevronsDownUp, label: "Collapse All" },
              { icon: ChevronsUpDown, label: "Expand All" },
              { icon: FileText, label: "Export" },
              { icon: Code2, label: "Markdown View" },
            ].map(({ icon: I, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs font-medium">
                <I className="w-3.5 h-3.5" /> {label}
              </span>
            ))}
          </div>

          <p className="font-semibold text-foreground pt-2">Collapse and expand branches</p>
          <p>Parent nodes have a small toggle at the bottom. Click it to collapse children — useful for focusing on one area during reviews.</p>
          <div className="flex items-center gap-6 py-2">
            <div className="text-center space-y-1">
              <MockNode label="Auth" status="untested" type="manual" childCount={3} collapsed />
              <p className="text-xs text-muted-foreground mt-4">Collapsed — 3 children hidden</p>
            </div>
            <div className="text-center space-y-1">
              <MockNode label="Auth" status="untested" type="manual" childCount={3} collapsed={false} />
              <p className="text-xs text-muted-foreground mt-4">Expanded</p>
            </div>
          </div>

          <p className="font-semibold text-foreground pt-2">Layout direction</p>
          <p>Use <strong>Fit to Screen</strong> <Maximize className="w-3.5 h-3.5 inline" /> in the toolbar to recenter your view. The layout auto-arranges nodes horizontally (left-to-right). Toggle between LR and TB from the toolbar settings.</p>

          <p className="font-semibold text-foreground pt-2">Bulk actions</p>
          <p>Select multiple nodes with <KeyboardKey>Shift</KeyboardKey> + click. A bar appears at the bottom to set all selected nodes to Verified, Failed, or Untested at once.</p>

          <p className="font-semibold text-foreground pt-2">Settings <Settings className="w-3.5 h-3.5 inline" /></p>
          <p>The gear icon (top-right) opens a menu to toggle <strong>dark mode</strong> and download the example markdown file.</p>
        </Step>

        {/* ---- Step 5: Filters & coverage -------------------------------- */}
        <Step n={5} title="Filters & coverage" id="filters">
          <p>The <strong>bottom bar</strong> has filter toggles. Click any filter to show or hide that metadata on all nodes:</p>

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

          <p className="font-semibold text-foreground pt-2">Coverage bar (top-center)</p>
          <p>Shows a real-time count of all scenarios in your map:</p>
          <div className="inline-flex items-center gap-4 px-5 py-2.5 bg-card border border-border rounded-full text-sm font-semibold">
            <span className="text-muted-foreground">49 scenarios</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> 17</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-muted-foreground" /> 32</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> 0</span>
          </div>
          <p className="text-sm"><span className="text-green-600 font-semibold">Green</span> = verified. <span className="font-semibold">Gray</span> = untested. <span className="text-red-600 font-semibold">Red</span> = failed. Updates instantly as you change statuses.</p>
        </Step>

        {/* ---- Step 6: Export & backup ----------------------------------- */}
        <Step n={6} title="Export and backup" id="export">
          <Callout type="warning">
            <p className="text-foreground font-semibold">Your data lives in your browser only.</p>
            <p className="text-muted-foreground">Clearing browser data, switching browsers, or using incognito mode will lose your maps. Export regularly.</p>
          </Callout>

          <p className="pt-2">Press <KeyboardKey>⌘</KeyboardKey> + <KeyboardKey>E</KeyboardKey> to export your map to markdown. You can copy it to clipboard or download as a <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">.md</code> file.</p>

          <p>Press <KeyboardKey>⌘</KeyboardKey> + <KeyboardKey>I</KeyboardKey> to import. Choose &quot;Create New Map&quot; or &quot;Replace Current Map&quot;.</p>

          <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 pt-2">Markdown format</p>
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
          <p>Each indentation level becomes a parent → child relationship. The format is human-readable and git-friendly — commit it to your repo as a backup.</p>
        </Step>

        {/* ---- Keyboard shortcuts --------------------------------------- */}
        <section id="shortcuts" className="scroll-mt-24">
          <h2 className="text-xl font-bold mb-2">Keyboard shortcuts</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Press <KeyboardKey>?</KeyboardKey> in the workspace to see this list.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { keys: ["Tab"], action: "Add child scenario" },
              { keys: ["Backspace"], action: "Delete selected" },
              { keys: ["⌘", "Z"], action: "Undo" },
              { keys: ["⌘", "⇧", "Z"], action: "Redo" },
              { keys: ["⌘", "E"], action: "Export markdown" },
              { keys: ["⌘", "I"], action: "Import markdown" },
              { keys: ["Double-click"], action: "Edit scenario" },
              { keys: ["?"], action: "Show shortcuts" },
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

        {/* ---- CTA ------------------------------------------------------ */}
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
