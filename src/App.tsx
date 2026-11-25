import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Code2,
  Container,
  Copy,
  Eye,
  EyeOff,
  FileCode2,
  Play,
  Radar,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  AWESOME_CATALOG,
  DEFAULT_GITIGNORE_RULES,
  evaluateGitignorePath,
  generateDockerComposeYaml,
  generateZodFromJson,
  type AwesomeItem,
} from './core/listRadarEngine.ts';
import { decodeHashState, WorkbenchShell } from './components/WorkbenchShell.tsx';

type Mode = 'overlay' | 'sandbox' | 'compose';

function StarSparkline({ pts, alive }: { pts: number[]; alive: boolean }) {
  const max = Math.max(1, ...pts);
  const coords = pts.map((v, i) => `${(i / (pts.length - 1)) * 56},${18 - (v / max) * 16}`).join(' ');
  return (
    <svg width="56" height="20" className="overflow-visible">
      <polyline fill="none" stroke={alive ? '#22d3ee' : '#f43f5e'} strokeWidth="1.8" strokeLinecap="round" points={coords} />
    </svg>
  );
}

export function App() {
  const initial = useMemo(() => decodeHashState<{ mode?: Mode; overlay?: boolean; apiId?: string }>(), []);
  const [mode, setMode] = useState<Mode>(initial?.mode ?? 'overlay');
  const [overlayOn, setOverlayOn] = useState<boolean>(initial?.overlay ?? true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'All' | AwesomeItem['category']>('All');
  const [aliveOnly, setAliveOnly] = useState(false);

  // Mode 2: API Sandbox
  const apiItems = useMemo(() => AWESOME_CATALOG.filter((i) => i.apiEndpoint), []);
  const [selectedApiId, setSelectedApiId] = useState<string>(initial?.apiId ?? apiItems[0].id);
  const [reqUrl, setReqUrl] = useState<string>(apiItems[0].apiEndpoint ?? '');
  const [reqHeaders, setReqHeaders] = useState<string>('Accept: application/json');
  const [liveFetchEnabled, setLiveFetchEnabled] = useState(false);
  const [apiResp, setApiResp] = useState<{ status: number; ms: number; body: unknown; live: boolean }>({
    status: 200,
    ms: 48,
    body: apiItems[0].mockResponse,
    live: false,
  });
  const [codeTab, setCodeTab] = useState<'zod' | 'fetch' | 'curl'>('zod');
  const [copiedCode, setCopiedCode] = useState(false);

  // Mode 3: Compose & .gitignore
  const dockerItems = useMemo(() => AWESOME_CATALOG.filter((i) => i.docker), []);
  const [selectedDockerIds, setSelectedDockerIds] = useState<string[]>(['traefik', 'grafana', 'postgres']);
  const [gitignoreRules, setGitignoreRules] = useState(DEFAULT_GITIGNORE_RULES);
  const [testPath, setTestPath] = useState('.env.example');

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return AWESOME_CATALOG.filter((i) => {
      if (catFilter !== 'All' && i.category !== catFilter) return false;
      if (aliveOnly && !i.alive) return false;
      if (!q) return true;
      return `${i.name} ${i.description} ${i.listSource} ${i.license}`.toLowerCase().includes(q);
    });
  }, [search, catFilter, aliveOnly]);

  const composeYaml = useMemo(() => generateDockerComposeYaml(selectedDockerIds), [selectedDockerIds]);
  const gitignoreEval = useMemo(() => evaluateGitignorePath(gitignoreRules, testPath), [gitignoreRules, testPath]);

  const selectApi = (item: AwesomeItem) => {
    setSelectedApiId(item.id);
    setReqUrl(item.apiEndpoint ?? '');
    setApiResp({ status: item.alive ? 200 : 410, ms: item.alive ? 54 : 18, body: item.mockResponse ?? {}, live: false });
    setMode('sandbox');
  };

  const runApiRequest = async () => {
    const t0 = performance.now();
    if (liveFetchEnabled && reqUrl.startsWith('https://')) {
      try {
        const r = await fetch(reqUrl);
        const body = await r.json();
        setApiResp({ status: r.status, ms: Math.round(performance.now() - t0), body, live: true });
        return;
      } catch (err) {
        setApiResp({ status: 0, ms: Math.round(performance.now() - t0), body: { corsOrNetworkFallback: String(err) }, live: true });
        return;
      }
    }
    const found = apiItems.find((a) => a.id === selectedApiId);
    setApiResp({
      status: found?.alive ? 200 : 410,
      ms: Math.round(28 + Math.random() * 64),
      body: found?.mockResponse ?? { ok: true, url: reqUrl },
      live: false,
    });
  };

  const generatedSnippet = useMemo(() => {
    if (codeTab === 'zod') return generateZodFromJson(apiResp.body, 'EndpointResponse');
    if (codeTab === 'fetch') return `const res = await fetch("${reqUrl}", {\n  headers: { "Accept": "application/json" }\n});\nconst data = await res.json();`;
    return `curl -sS -H "${reqHeaders.split('\n')[0] || 'Accept: application/json'}" "${reqUrl}" | jq`;
  }, [codeTab, apiResp.body, reqUrl, reqHeaders]);

  const buildStackSvg = () => {
    const chosen = dockerItems.filter((d) => selectedDockerIds.includes(d.id));
    const boxes = chosen
      .map((item, i) => {
        const x = 60 + i * 210;
        return `<g transform="translate(${x},90)"><line x1="85" y1="-42" x2="85" y2="0" stroke="#22d3ee" stroke-width="2" /><rect width="170" height="86" rx="10" fill="#0F172A" stroke="#22d3ee" stroke-width="1.8" /><text x="12" y="26" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="700">${item.docker!.service}</text><text x="12" y="48" fill="#94a3b8" font-family="monospace" font-size="10">${item.docker!.port}</text><text x="12" y="68" fill="#34d399" font-family="monospace" font-size="9">${item.docker!.image.slice(0, 24)}</text></g>`;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(720, chosen.length * 220 + 80)}" height="230"><rect width="100%" height="100%" fill="#070B14" /><rect x="60" y="20" width="600" height="28" rx="8" fill="#0F172A" stroke="#38bdf8" /><text x="360" y="39" text-anchor="middle" fill="#7dd3fc" font-family="monospace" font-size="12" font-weight="700">bridge network: aether_stack</text>${boxes}</svg>`;
  };

  return (
    <WorkbenchShell
      name="list-radar"
      subtitle="GitHub Awesome-List Overlay · Live API Sandbox · Compose & .gitignore Studio"
      badge="CHROME MV3 + WEB"
      accentHex="#22d3ee"
      icon={<Radar className="h-4 w-4" />}
      modes={[
        { id: 'overlay', label: 'GitHub List Overlay', shortKey: '1' },
        { id: 'sandbox', label: 'Inline API Sandbox', shortKey: '2' },
        { id: 'compose', label: 'Compose & .gitignore', shortKey: '3' },
      ]}
      activeMode={mode}
      onModeChange={(id) => setMode(id as Mode)}
      getShareState={() => ({ mode, overlay: overlayOn, apiId: selectedApiId })}
      actions={[
        { id: 'toggle-overlay', label: 'Toggle Chrome MV3 Overlay Injection', group: 'Overlay', run: () => setOverlayOn((v) => !v) },
        { id: 'run-api', label: 'Execute Current API Sandbox Request', group: 'API', run: () => { setMode('sandbox'); runApiRequest(); } },
      ]}
      exportBundle={{
        filenameBase: `list-radar-${mode}`,
        svg: buildStackSvg,
        markdown: () =>
          `# list-radar Audit Report\n\n| Project | List | Stars | License | Status |\n| :--- | :--- | ---: | :--- | :---: |\n` +
          filteredCatalog.map((i) => `| ${i.name} | \`${i.listSource}\` | ${i.stars.toLocaleString()} | ${i.license} | ${i.alive ? 'ALIVE' : 'DEAD'} |`).join('\n'),
        json: () => ({ filteredCatalog, selectedDockerIds, gitignoreEval }),
        codeLabel: 'Generated docker-compose.yml',
        codeExt: 'yml',
        code: () => composeYaml,
      }}
    >
      {/* MODE 1: GITHUB LIST OVERLAY SIMULATOR */}
      {mode === 'overlay' && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E293B] bg-[#0B1221] px-4 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOverlayOn((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-semibold transition ${
                  overlayOn
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-cyan-200'
                    : 'border-slate-700 bg-[#0F172A] text-slate-400'
                }`}
              >
                {overlayOn ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>MV3 Overlay: {overlayOn ? 'INJECTED' : 'OFF (Raw README)'}</span>
              </button>
              {(['All', 'Public API', 'Self-Hosted', 'Python / Go', 'Learning / Prompts'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatFilter(c)}
                  className={`rounded-md border px-2 py-1 ${
                    catFilter === c ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200' : 'border-[#1E293B] bg-[#0F172A] text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAliveOnly((v) => !v)}
                className={`rounded-md border px-2 py-1 ${aliveOnly ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' : 'border-[#1E293B] bg-[#0F172A] text-slate-400'}`}
              >
                Hide Dead Links
              </button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter awesome lists..."
                className="w-48 rounded-lg border border-[#1E293B] bg-[#070B14] py-1 pl-8 pr-2.5 font-mono text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-5xl rounded-2xl border border-[#1E293B] bg-[#0F172A] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0B1221] px-5 py-3 font-mono text-xs text-slate-400">
                <span>github.com / sindresorhus / awesome — README.md</span>
                <span className="text-cyan-300">{filteredCatalog.length} entries indexed</span>
              </div>
              <div className="divide-y divide-[#1E293B]">
                {filteredCatalog.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 hover:bg-[#131E33]/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-cyan-300">{item.name}</span>
                        <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                          {item.listSource}
                        </span>
                        {overlayOn && (
                          <>
                            <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${item.alive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {item.alive ? `★ ${(item.stars / 1000).toFixed(1)}k · ${item.lastCommitDays}d ago` : 'DEAD LINK (410)'}
                            </span>
                            <span className="rounded border border-slate-700 bg-[#070B14] px-1.5 py-0.5 font-mono text-[10px] text-slate-300">
                              {item.license}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-300">{item.description}</p>
                    </div>

                    {overlayOn && (
                      <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                          <div className="font-mono text-[9px] uppercase text-slate-500">Star Velocity</div>
                          <StarSparkline pts={item.velocitySpark} alive={item.alive} />
                        </div>
                        {item.apiEndpoint && (
                          <button
                            type="button"
                            onClick={() => selectApi(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/25"
                          >
                            <Play className="h-3 w-3" /> Test Live
                          </button>
                        )}
                        {item.docker && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDockerIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
                              setMode('compose');
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/25"
                          >
                            <Container className="h-3 w-3" /> + Compose
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: INLINE API SANDBOX */}
      {mode === 'sandbox' && (
        <div className="grid flex-1 overflow-hidden lg:grid-cols-[0.95fr_1.25fr]">
          <section className="flex flex-col space-y-4 overflow-y-auto border-r border-[#1E293B] p-5">
            <div className="flex flex-wrap gap-1.5">
              {apiItems.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => selectApi(a)}
                  className={`rounded-lg border px-2.5 py-1 text-xs ${
                    selectedApiId === a.id ? 'border-cyan-500/60 bg-cyan-500/15 font-semibold text-cyan-200' : 'border-[#1E293B] bg-[#0F172A] text-slate-300'
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>

            <div className="space-y-2.5 rounded-xl border border-[#1E293B] bg-[#0F172A] p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-300">Request Runner</span>
                <label className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                  <input type="checkbox" checked={liveFetchEnabled} onChange={(e) => setLiveFetchEnabled(e.target.checked)} className="accent-cyan-400" />
                  Live Browser Fetch (CORS)
                </label>
              </div>
              <div className="flex gap-2">
                <span className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-2 font-mono text-xs font-bold text-emerald-300">GET</span>
                <input
                  value={reqUrl}
                  onChange={(e) => setReqUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-[#1E293B] bg-[#070B14] px-3 py-1.5 font-mono text-xs text-cyan-100"
                />
                <button
                  type="button"
                  onClick={runApiRequest}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-cyan-400"
                >
                  <Play className="h-3.5 w-3.5" /> Send
                </button>
              </div>
              <textarea
                value={reqHeaders}
                onChange={(e) => setReqHeaders(e.target.value)}
                className="h-16 w-full rounded-lg border border-[#1E293B] bg-[#070B14] p-2.5 font-mono text-xs text-slate-300"
              />
            </div>

            {/* Generated Typed Code / Zod Export */}
            <div className="flex flex-1 flex-col rounded-xl border border-[#1E293B] bg-[#0F172A] overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#1E293B] px-3.5 py-2 text-xs">
                <div className="flex gap-1">
                  {(['zod', 'fetch', 'curl'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCodeTab(t)}
                      className={`rounded px-2 py-0.5 font-mono text-[11px] uppercase ${codeTab === t ? 'bg-cyan-500/20 text-cyan-200 font-bold' : 'text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(generatedSnippet);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 1500);
                    } catch {}
                  }}
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-300"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />} Copy
                </button>
              </div>
              <pre className="flex-1 overflow-auto bg-[#070B14] p-3.5 font-mono text-xs text-emerald-200">{generatedSnippet}</pre>
            </div>
          </section>

          <section className="flex flex-col space-y-4 overflow-y-auto bg-[#0F172A] p-5">
            <div className="rounded-xl border border-[#1E293B] bg-[#070B14] p-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className={`rounded px-2 py-0.5 font-bold ${apiResp.status >= 200 && apiResp.status < 300 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  HTTP {apiResp.status} ({apiResp.live ? 'LIVE' : 'SIMULATED'})
                </span>
                <span className="text-cyan-300">Latency: {apiResp.ms}ms</span>
              </div>
              <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div className="bg-sky-400" style={{ width: '20%' }} title="DNS + TLS" />
                <div className="bg-cyan-400" style={{ width: '58%' }} title="TTFB" />
                <div className="bg-emerald-400" style={{ width: '22%' }} title="Payload Download" />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-500">
                <span>DNS/TLS {Math.round(apiResp.ms * 0.2)}ms</span>
                <span>TTFB {Math.round(apiResp.ms * 0.58)}ms</span>
                <span>Body {Math.round(apiResp.ms * 0.22)}ms</span>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-[#1E293B] bg-[#070B14] p-4 overflow-auto">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Code2 className="h-3.5 w-3.5 text-cyan-400" /> Formatted JSON Response Tree
              </div>
              <pre className="font-mono text-xs leading-5 text-sky-100">{JSON.stringify(apiResp.body, null, 2)}</pre>
            </div>
          </section>
        </div>
      )}

      {/* MODE 3: DOCKER-COMPOSE & .GITIGNORE VISUAL STUDIO */}
      {mode === 'compose' && (
        <div className="grid flex-1 overflow-hidden lg:grid-cols-2">
          {/* Self-Hosted Docker Compose Composer */}
          <section className="flex flex-col space-y-4 overflow-y-auto border-r border-[#1E293B] p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Container className="h-4 w-4" /> Self-Hosted Stack Composer (`docker-compose.yml`)
              </h2>
              <span className="font-mono text-xs text-slate-400">{selectedDockerIds.length} containers wired</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {dockerItems.map((item) => {
                const active = selectedDockerIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelectedDockerIds((prev) =>
                        prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id],
                      )
                    }
                    className={`rounded-xl border p-3 text-left transition ${
                      active ? 'border-cyan-400 bg-cyan-500/10' : 'border-[#1E293B] bg-[#0F172A] opacity-65'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-100">
                      <span>{item.docker!.service}</span>
                      <span className="text-emerald-300">{item.docker!.port}</span>
                    </div>
                    <div className="mt-1 truncate font-mono text-[10px] text-slate-400">{item.docker!.image}</div>
                  </button>
                );
              })}
            </div>

            {/* Interactive SVG Network Wiring */}
            <div className="rounded-xl border border-[#1E293B] bg-[#0F172A] p-3 overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: buildStackSvg() }} />
            </div>

            <pre className="flex-1 overflow-auto rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 font-mono text-[11.5px] leading-5 text-emerald-200">
              {composeYaml}
            </pre>
          </section>

          {/* .gitignore Rule-Precedence Tester */}
          <section className="flex flex-col space-y-4 overflow-y-auto bg-[#0F172A] p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <FileCode2 className="h-4 w-4" /> `.gitignore` Rule-Precedence Tree Tester
              </h2>
              <span
                className={`rounded px-2 py-0.5 font-mono text-xs font-bold ${
                  gitignoreEval.ignored ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {gitignoreEval.ignored ? 'IGNORED BY GIT' : 'TRACKED BY GIT'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                placeholder="Type file path e.g. dist/app.js or .env.example"
                className="flex-1 rounded-lg border border-[#1E293B] bg-[#070B14] px-3 py-2 font-mono text-xs text-cyan-200 focus:border-cyan-500 focus:outline-none"
              />
              {['.env.local', '.env.example', 'node_modules/pkg/index.js', '.vscode/extensions.json'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setTestPath(sample)}
                  className="rounded border border-[#1E293B] bg-[#070B14] px-2 py-1 font-mono text-[10px] text-slate-300 hover:border-cyan-500"
                >
                  {sample}
                </button>
              ))}
            </div>

            <textarea
              value={gitignoreRules}
              onChange={(e) => setGitignoreRules(e.target.value)}
              spellCheck={false}
              className="h-44 w-full resize-none rounded-xl border border-[#1E293B] bg-[#070B14] p-3.5 font-mono text-xs leading-5 text-slate-200 focus:outline-none"
            />

            <div className="space-y-1.5 rounded-xl border border-[#1E293B] bg-[#070B14] p-4">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Precedence Evaluation Trace
              </div>
              {gitignoreEval.evaluations.map((ev) => {
                const isWinner = gitignoreEval.winningRule?.lineNumber === ev.lineNumber;
                return (
                  <div
                    key={ev.lineNumber}
                    className={`flex items-center justify-between rounded-lg border px-3 py-1.5 font-mono text-xs ${
                      isWinner
                        ? ev.negated
                          ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                          : 'border-rose-400 bg-rose-500/15 text-rose-200'
                        : ev.matched
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                          : 'border-[#1E293B] bg-[#0F172A] text-slate-500'
                    }`}
                  >
                    <span>L{ev.lineNumber}: {ev.rule}</span>
                    <span>
                      {isWinner ? (ev.negated ? 'WINNER (RE-INCLUDED)' : 'WINNER (IGNORED)') : ev.matched ? 'matched (overridden)' : 'no match'}
                    </span>
                  </div>
                );
              })}
              {!gitignoreEval.winningRule && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> No rule matched — file will be tracked by Git.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </WorkbenchShell>
  );
}

export default App;
