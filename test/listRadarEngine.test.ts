import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GITIGNORE_RULES,
  evaluateGitignorePath,
  generateDockerComposeYaml,
  generateZodFromJson,
} from '../src/core/listRadarEngine.ts';

describe('list-radar engine', () => {
  it('generates valid multi-service docker-compose YAML with shared network and volumes', () => {
    const yaml = generateDockerComposeYaml(['traefik', 'grafana', 'postgres']);
    expect(yaml).toContain('traefik:v3.2');
    expect(yaml).toContain('grafana_data:/var/lib/grafana');
    expect(yaml).toContain('aether_stack:');
  });

  it('evaluates .gitignore rule precedence including negation overrides', () => {
    expect(evaluateGitignorePath(DEFAULT_GITIGNORE_RULES, '.env.local').ignored).toBe(true);
    const ex = evaluateGitignorePath(DEFAULT_GITIGNORE_RULES, '.env.example');
    expect(ex.ignored).toBe(false);
    expect(ex.winningRule?.negated).toBe(true);
  });

  it('infers Zod schemas from JSON API responses', () => {
    const zod = generateZodFromJson({ ok: true, count: 42, tags: ['a'] }, 'TestResp');
    expect(zod).toContain('export const TestRespSchema = z.object');
    expect(zod).toContain('count: z.number()');
  });
});
