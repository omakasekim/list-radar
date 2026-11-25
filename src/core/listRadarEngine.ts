export interface AwesomeItem {
  id: string;
  name: string;
  repo: string;
  listSource: string;
  category: 'Public API' | 'Self-Hosted' | 'Python / Go' | 'Learning / Prompts';
  description: string;
  stars: number;
  velocitySpark: number[];
  lastCommitDays: number;
  license: string;
  alive: boolean;
  apiEndpoint?: string;
  mockResponse?: Record<string, unknown>;
  docker?: {
    service: string;
    image: string;
    port: string;
    volume: string;
    env: string[];
  };
}

export const AWESOME_CATALOG: AwesomeItem[] = [
  {
    id: 'gh-api',
    name: 'GitHub REST API',
    repo: 'public-apis/public-apis',
    listSource: 'public-apis',
    category: 'Public API',
    description: 'Repository metadata, commit graphs, and release feeds with zero-auth public endpoints.',
    stars: 318000,
    velocitySpark: [42, 48, 55, 61, 59, 68, 74],
    lastCommitDays: 2,
    license: 'MIT',
    alive: true,
    apiEndpoint: 'https://api.github.com/repos/omakasekim/diffcanvas',
    mockResponse: { name: 'diffcanvas', visibility: 'public', stargazers_count: 142, default_branch: 'main', topics: ['git', 'diff', 'react'] },
  },
  {
    id: 'open-meteo',
    name: 'Open-Meteo Weather API',
    repo: 'open-meteo/open-meteo',
    listSource: 'public-apis',
    category: 'Public API',
    description: 'High-resolution weather forecast JSON API with zero API key required and CORS enabled.',
    stars: 3420,
    velocitySpark: [18, 22, 24, 29, 34, 38, 45],
    lastCommitDays: 1,
    license: 'AGPL-3.0',
    alive: true,
    apiEndpoint: 'https://api.open-meteo.com/v1/forecast?latitude=37.56&longitude=126.97&current_weather=true',
    mockResponse: { latitude: 37.56, longitude: 126.97, current_weather: { temperature: 11.4, windspeed: 9.2, weathercode: 1 } },
  },
  {
    id: 'legacy-crypto-api',
    name: 'CoinLore Legacy Feed (Stale)',
    repo: 'legacy/coinlore-v1',
    listSource: 'public-apis',
    category: 'Public API',
    description: 'Deprecated ticker endpoint returning HTTP 410 / TLS timeout in awesome-list audits.',
    stars: 210,
    velocitySpark: [12, 9, 6, 4, 2, 1, 0],
    lastCommitDays: 940,
    license: 'Unknown',
    alive: false,
    apiEndpoint: 'https://api.example.invalid/v1/tickers',
    mockResponse: { error: '410 Gone — endpoint sunset' },
  },
  {
    id: 'traefik',
    name: 'Traefik Proxy',
    repo: 'traefik/traefik',
    listSource: 'awesome-selfhosted',
    category: 'Self-Hosted',
    description: 'Cloud-native edge router with automatic Let’s Encrypt TLS and Docker label discovery.',
    stars: 53400,
    velocitySpark: [51, 54, 58, 60, 62, 66, 71],
    lastCommitDays: 1,
    license: 'MIT',
    alive: true,
    docker: { service: 'traefik', image: 'traefik:v3.2', port: '80:80', volume: '/var/run/docker.sock:/var/run/docker.sock:ro', env: ['TRAEFIK_API_DASHBOARD=true'] },
  },
  {
    id: 'grafana',
    name: 'Grafana OSS',
    repo: 'grafana/grafana',
    listSource: 'awesome-selfhosted',
    category: 'Self-Hosted',
    description: 'Observability dashboards, Prometheus/Loki telemetry queries, and alert routing.',
    stars: 66800,
    velocitySpark: [60, 62, 65, 68, 72, 75, 81],
    lastCommitDays: 0,
    license: 'AGPL-3.0',
    alive: true,
    docker: { service: 'grafana', image: 'grafana/grafana:11.4', port: '3000:3000', volume: 'grafana_data:/var/lib/grafana', env: ['GF_SECURITY_ADMIN_USER=admin'] },
  },
  {
    id: 'immich',
    name: 'Immich Photo Server',
    repo: 'immich-app/immich',
    listSource: 'awesome-selfhosted',
    category: 'Self-Hosted',
    description: 'Self-hosted photo and video backup with hardware-accelerated CLIP search.',
    stars: 61200,
    velocitySpark: [35, 44, 58, 72, 85, 92, 99],
    lastCommitDays: 0,
    license: 'AGPL-3.0',
    alive: true,
    docker: { service: 'immich', image: 'ghcr.io/immich-app/immich-server:release', port: '2283:2283', volume: 'immich_uploads:/usr/src/app/upload', env: ['DB_HOSTNAME=postgres'] },
  },
  {
    id: 'postgres',
    name: 'PostgreSQL 17 + pgvector',
    repo: 'pgvector/pgvector',
    listSource: 'awesome-selfhosted',
    category: 'Self-Hosted',
    description: 'Relational + HNSW vector database backing self-hosted stacks.',
    stars: 14800,
    velocitySpark: [24, 31, 39, 46, 54, 61, 69],
    lastCommitDays: 3,
    license: 'PostgreSQL',
    alive: true,
    docker: { service: 'postgres', image: 'pgvector/pgvector:pg17', port: '5432:5432', volume: 'pg_data:/var/lib/postgresql/data', env: ['POSTGRES_USER=app', 'POSTGRES_DB=stack'] },
  },
  {
    id: 'fastapi',
    name: 'FastAPI',
    repo: 'fastapi/fastapi',
    listSource: 'awesome-python',
    category: 'Python / Go',
    description: 'Type-annotated async Python web framework with automatic OpenAPI 3.1 schema generation.',
    stars: 81400,
    velocitySpark: [68, 71, 74, 79, 82, 85, 90],
    lastCommitDays: 2,
    license: 'MIT',
    alive: true,
  },
  {
    id: 'caddy',
    name: 'Caddy Web Server',
    repo: 'caddyserver/caddy',
    listSource: 'awesome-go',
    category: 'Python / Go',
    description: 'Fast, multi-platform Go HTTP/3 server with automatic HTTPS by default.',
    stars: 62100,
    velocitySpark: [45, 48, 52, 55, 58, 61, 64],
    lastCommitDays: 4,
    license: 'Apache-2.0',
    alive: true,
  },
  {
    id: 'prompts-chat',
    name: 'Awesome ChatGPT Prompts',
    repo: 'f/awesome-chatgpt-prompts',
    listSource: 'prompts.chat',
    category: 'Learning / Prompts',
    description: 'Curated prompt engineering templates and system role libraries.',
    stars: 121000,
    velocitySpark: [40, 44, 49, 52, 58, 62, 66],
    lastCommitDays: 5,
    license: 'CC0-1.0',
    alive: true,
  },
];

export function generateDockerComposeYaml(selectedIds: string[]): string {
  const chosen = AWESOME_CATALOG.filter((i) => i.docker && selectedIds.includes(i.id));
  if (chosen.length === 0) return '# Select at least one self-hosted container to generate docker-compose.yml\n';
  const volumes = new Set<string>();
  const serviceBlocks = chosen.map((item) => {
    const d = item.docker!;
    const volName = d.volume.split(':')[0];
    if (!volName.startsWith('/')) volumes.add(volName);
    return [
      `  ${d.service}:`,
      `    image: ${d.image}`,
      `    restart: unless-stopped`,
      `    ports:`,
      `      - "${d.port}"`,
      `    volumes:`,
      `      - ${d.volume}`,
      `    environment:`,
      ...d.env.map((e) => `      - ${e}`),
      `    networks:`,
      `      - aether_stack`,
    ].join('\n');
  });
  const volBlock = volumes.size
    ? ['volumes:', ...Array.from(volumes).map((v) => `  ${v}:`)].join('\n')
    : '';
  return [
    '# Generated by list-radar Stack Composer',
    'services:',
    ...serviceBlocks,
    '',
    'networks:',
    '  aether_stack:',
    '    driver: bridge',
    volBlock ? `\n${volBlock}` : '',
  ].join('\n') + '\n';
}

export interface GitignoreRuleEval {
  lineNumber: number;
  rule: string;
  negated: boolean;
  matched: boolean;
}

export function evaluateGitignorePath(rulesText: string, targetPath: string): {
  ignored: boolean;
  winningRule: GitignoreRuleEval | null;
  evaluations: GitignoreRuleEval[];
} {
  const normalizedTarget = targetPath.trim().replace(/^\/+/, '');
  const lines = rulesText.replace(/\r\n/g, '\n').split('\n');
  const evaluations: GitignoreRuleEval[] = [];
  let ignored = false;
  let winningRule: GitignoreRuleEval | null = null;

  lines.forEach((raw, idx) => {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const negated = trimmed.startsWith('!');
    const pattern = (negated ? trimmed.slice(1) : trimmed).replace(/^\/+/, '');
    const dirOnly = pattern.endsWith('/');
    const cleanPat = dirOnly ? pattern.slice(0, -1) : pattern;
    const escaped = cleanPat
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '::GLOBSTAR::')
      .replace(/\*/g, '[^/]*')
      .replace(/::GLOBSTAR::/g, '.*');
    const regex = dirOnly
      ? new RegExp(`(?:^|/)${escaped}(?:/|$)`)
      : pattern.includes('/')
        ? new RegExp(`^${escaped}(?:/.*)?$`)
        : new RegExp(`(?:^|/)${escaped}(?:/.*)?$`);

    const matched = Boolean(normalizedTarget) && regex.test(normalizedTarget);
    const ev: GitignoreRuleEval = { lineNumber: idx + 1, rule: trimmed, negated, matched };
    evaluations.push(ev);
    if (matched) {
      ignored = !negated;
      winningRule = ev;
    }
  });

  return { ignored, winningRule, evaluations };
}

export function generateZodFromJson(value: unknown, rootName = 'ApiResponse'): string {
  const infer = (v: unknown, indent = 2): string => {
    if (v === null) return 'z.null()';
    if (Array.isArray(v)) return `z.array(${v.length ? infer(v[0], indent) : 'z.unknown()'})`;
    if (typeof v === 'string') return 'z.string()';
    if (typeof v === 'number') return 'z.number()';
    if (typeof v === 'boolean') return 'z.boolean()';
    if (typeof v === 'object') {
      const pad = ' '.repeat(indent);
      const entries = Object.entries(v as Record<string, unknown>).map(
        ([k, val]) => `${pad}${/^[A-Za-z_]\w*$/.test(k) ? k : JSON.stringify(k)}: ${infer(val, indent + 2)},`,
      );
      return `z.object({\n${entries.join('\n')}\n${' '.repeat(indent - 2)}})`;
    }
    return 'z.unknown()';
  };
  return `import { z } from "zod";\n\nexport const ${rootName}Schema = ${infer(value)};\nexport type ${rootName} = z.infer<typeof ${rootName}Schema>;`;
}

export const DEFAULT_GITIGNORE_RULES = `# Dependencies & build artifacts
node_modules/
dist/
*.log

# Environment secrets (ignore all except example)
.env
.env.*
!.env.example

# macOS & IDE
.DS_Store
.vscode/*
!.vscode/extensions.json`;
