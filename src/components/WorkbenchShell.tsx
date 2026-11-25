import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  Command,
  Download,
  FileCode2,
  FileJson,
  Image as ImageIcon,
  Keyboard,
  Share2,
  X,
} from "lucide-react";

export interface PaletteAction {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  run: () => void;
}

export interface ExportBundle {
  filenameBase: string;
  svg?: () => string;
  markdown: () => string;
  json: () => unknown;
  codeLabel?: string;
  codeExt?: string;
  code?: () => string;
}

interface WorkbenchShellProps {
  name: string;
  subtitle: string;
  badge: string;
  accentHex: string;
  icon: ReactNode;
  modes: Array<{ id: string; label: string; shortKey: string }>;
  activeMode: string;
  onModeChange: (id: string) => void;
  actions: PaletteAction[];
  exportBundle: ExportBundle;
  getShareState: () => Record<string, unknown>;
  onResetView?: () => void;
  onTogglePlay?: () => void;
  onStep?: (dir: -1 | 1) => void;
  headerExtra?: ReactNode;
  children: ReactNode;
}

export function decodeHashState<T extends Record<string, unknown>>(): Partial<T> | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/state=([^&]+)/);
  if (!match) return null;
  try {
    const json = decodeURIComponent(atob(match[1].replace(/-/g, "+").replace(/_/g, "/")));
    return JSON.parse(json) as Partial<T>;
  } catch {
    return null;
  }
}

function encodeHashState(obj: Record<string, unknown>): string {
  const b64 = btoa(encodeURIComponent(JSON.stringify(obj)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `#state=${b64}`;
}

function triggerDownload(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

export function WorkbenchShell({
  name,
  subtitle,
  badge,
  accentHex,
  icon,
  modes,
  activeMode,
  onModeChange,
  actions,
  exportBundle,
  getShareState,
  onResetView,
  onTogglePlay,
  onStep,
  headerExtra,
  children,
}: WorkbenchShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const shareSnapshot = async () => {
    const hash = encodeHashState(getShareState());
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", hash);
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        /* ignore clipboard restrictions */
      }
    }
    setCopiedShare(true);
    showToast("Snapshot URL encoded into hash & copied");
    setTimeout(() => setCopiedShare(false), 1800);
  };

  const exportPngFromSvg = () => {
    const svgText = exportBundle.svg?.();
    if (!svgText) {
      showToast("SVG export unavailable in this view");
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }));
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width || 1200;
      c.height = img.height || 700;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#070B14";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0);
        c.toBlob((png) => {
          if (png) triggerDownload(png, `${exportBundle.filenameBase}.png`, "image/png");
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    showToast("Exported PNG image");
  };

  const allActions = useMemo<PaletteAction[]>(() => {
    const builtIn: PaletteAction[] = [
      ...modes.map((m) => ({
        id: `mode-${m.id}`,
        label: `Switch to ${m.label}`,
        group: "Modes",
        shortcut: m.shortKey,
        run: () => onModeChange(m.id),
      })),
      { id: "act-share", label: "Copy Share Snapshot URL (#state=...)", group: "Actions", run: shareSnapshot },
      { id: "act-export", label: "Open Multi-Format Export Drawer", group: "Exports", run: () => setExportOpen(true) },
      { id: "act-shortcuts", label: "Show Keyboard Shortcuts", group: "Help", shortcut: "?", run: () => setHelpOpen(true) },
    ];
    if (onResetView) builtIn.push({ id: "act-reset", label: "Reset / Fit Canvas View", group: "Canvas", shortcut: "R", run: onResetView });
    return [...builtIn, ...actions];
  }, [modes, onModeChange, actions, onResetView]);

  const filteredActions = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return allActions;
    return allActions.filter((a) => `${a.group} ${a.label}`.toLowerCase().includes(q));
  }, [allActions, cmdQuery]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
        setCmdQuery("");
        return;
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setHelpOpen(false);
        setExportOpen(false);
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen((v) => !v);
      } else if (e.key === "r" || e.key === "R") {
        onResetView?.();
      } else if (e.key === " " && onTogglePlay) {
        e.preventDefault();
        onTogglePlay();
      } else if (e.key === "ArrowLeft" && onStep) {
        onStep(-1);
      } else if (e.key === "ArrowRight" && onStep) {
        onStep(1);
      } else if (["1", "2", "3"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (modes[idx]) onModeChange(modes[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modes, onModeChange, onResetView, onTogglePlay, onStep]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070B14] text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-2.5 border-b border-[#1E293B] bg-[#0F172A] px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{ borderColor: `${accentHex}55`, backgroundColor: `${accentHex}18`, color: accentHex }}
            >
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold tracking-tight text-slate-50">{name}</h1>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide"
                  style={{ backgroundColor: `${accentHex}1c`, color: accentHex }}
                >
                  {badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{subtitle}</p>
            </div>
          </div>

          <div className="flex rounded-lg border border-[#1E293B] bg-[#070B14] p-0.5 text-xs">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onModeChange(m.id)}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition ${
                  activeMode === m.id ? "bg-slate-800 text-slate-50 shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="font-mono text-[10px] text-slate-500">{m.shortKey}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {headerExtra}
          <button
            type="button"
            onClick={() => {
              setCmdOpen(true);
              setCmdQuery("");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E293B] bg-[#070B14] px-2.5 py-1 font-mono text-[11px] text-slate-300 hover:border-slate-500"
            title="Open Command Palette (Cmd/Ctrl+K)"
          >
            <Command className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">⌘K</span>
          </button>
          <button
            type="button"
            onClick={shareSnapshot}
            className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#070B14] px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-500"
            title="Encode state into URL hash and copy"
          >
            {copiedShare ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-cyan-400" />}
            <span className="hidden md:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#1E293B] bg-[#070B14] px-2.5 py-1 text-xs text-slate-200 hover:border-emerald-500"
            title="Open Export Drawer"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export</span>
          </button>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="inline-flex items-center rounded-lg border border-[#1E293B] bg-[#070B14] p-1.5 text-slate-400 hover:border-slate-500 hover:text-slate-100"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden">{children}</div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl border border-emerald-500/40 bg-[#0F172A]/95 px-3.5 py-2 font-mono text-xs text-emerald-300 shadow-2xl backdrop-blur">
          {toast}
        </div>
      )}

      {/* Command Palette */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-20 backdrop-blur-sm" onClick={() => setCmdOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-[#070B14] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[#1E293B] bg-[#0F172A] px-4 py-3">
              <Command className="h-4 w-4 text-cyan-400" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Type a command, preset, or mode..."
                className="flex-1 bg-transparent font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <button type="button" onClick={() => setCmdOpen(false)} className="text-slate-400 hover:text-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredActions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    a.run();
                    setCmdOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-[#0F172A]"
                >
                  <div>
                    <span className="mr-2 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300">{a.group}</span>
                    <span className="text-slate-100">{a.label}</span>
                  </div>
                  {a.shortcut && <kbd className="rounded border border-slate-700 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">{a.shortcut}</kbd>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F172A] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h2 className="text-sm font-bold text-slate-50">Keyboard Shortcuts</h2>
              <button type="button" onClick={() => setHelpOpen(false)} className="text-slate-400 hover:text-slate-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-3 space-y-2 font-mono text-xs">
              {[
                ["⌘K / Ctrl+K", "Open Command Palette"],
                ["1 / 2 / 3", "Switch Workbench Modes"],
                ["R", "Reset / Fit Canvas View"],
                ["Space", "Play / Pause Simulation or Replay"],
                ["← / →", "Step Backward / Forward"],
                ["?", "Toggle Shortcuts Reference"],
                ["Esc", "Close Active Modal / Drawer"],
              ].map(([k, d]) => (
                <div key={k} className="flex items-center justify-between rounded-lg border border-[#1E293B] bg-[#070B14] px-3 py-2">
                  <span className="text-slate-300">{d}</span>
                  <kbd className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-cyan-300">{k}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Multi-Format Export Drawer */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" onClick={() => setExportOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-md flex-col border-l border-[#1E293B] bg-[#0F172A] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-50">Multi-Format Export Drawer</h2>
                <p className="text-[11px] text-slate-400">Export graphs, reports, and generated artifacts cleanly.</p>
              </div>
              <button type="button" onClick={() => setExportOpen(false)} className="text-slate-400 hover:text-slate-100"><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 flex-1 space-y-2.5 overflow-y-auto">
              {exportBundle.svg && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      triggerDownload(exportBundle.svg!(), `${exportBundle.filenameBase}.svg`, "image/svg+xml");
                      showToast("Downloaded SVG vector");
                    }}
                    className="flex w-full items-center justify-between rounded-xl border border-[#1E293B] bg-[#070B14] p-3.5 text-left hover:border-cyan-500"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-4 w-4 text-cyan-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-100">Vector Diagram (.svg)</div>
                        <div className="text-[11px] text-slate-400">Crisp dark-mode vector graphic</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-cyan-300">SVG</span>
                  </button>
                  <button
                    type="button"
                    onClick={exportPngFromSvg}
                    className="flex w-full items-center justify-between rounded-xl border border-[#1E293B] bg-[#070B14] p-3.5 text-left hover:border-emerald-500"
                  >
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-4 w-4 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-100">High-Res Raster (.png)</div>
                        <div className="text-[11px] text-slate-400">Ready for GitHub PRs, slides, and docs</div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-300">PNG</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  triggerDownload(exportBundle.markdown(), `${exportBundle.filenameBase}.md`, "text/markdown");
                  showToast("Downloaded Markdown report");
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[#1E293B] bg-[#070B14] p-3.5 text-left hover:border-violet-500"
              >
                <div className="flex items-center gap-3">
                  <FileCode2 className="h-4 w-4 text-violet-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-100">Markdown Report (.md)</div>
                    <div className="text-[11px] text-slate-400">Formatted audit tables & findings</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-violet-300">MD</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerDownload(JSON.stringify(exportBundle.json(), null, 2), `${exportBundle.filenameBase}.json`, "application/json");
                  showToast("Downloaded JSON snapshot");
                }}
                className="flex w-full items-center justify-between rounded-xl border border-[#1E293B] bg-[#070B14] p-3.5 text-left hover:border-amber-500"
              >
                <div className="flex items-center gap-3">
                  <FileJson className="h-4 w-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-100">Structured JSON Snapshot (.json)</div>
                    <div className="text-[11px] text-slate-400">Machine-readable data for CI pipelines</div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-amber-300">JSON</span>
              </button>

              {exportBundle.code && (
                <button
                  type="button"
                  onClick={() => {
                    triggerDownload(exportBundle.code!(), `${exportBundle.filenameBase}.${exportBundle.codeExt ?? "txt"}`, "text/plain");
                    showToast(`Downloaded ${exportBundle.codeLabel ?? "artifact"}`);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-3.5 text-left hover:border-emerald-400"
                >
                  <div className="flex items-center gap-3">
                    <FileCode2 className="h-4 w-4 text-emerald-300" />
                    <div>
                      <div className="text-xs font-bold text-emerald-200">{exportBundle.codeLabel ?? "Generated Artifact"}</div>
                      <div className="text-[11px] text-emerald-300/80">Production-ready generated file</div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase text-emerald-200">{exportBundle.codeExt ?? "OUT"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
