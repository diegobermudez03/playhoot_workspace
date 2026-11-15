// Claude Code status line: shows plan usage and saves it to .claude/usage.json
// so the agent can read it at the start and end of each stretch of work
// (docs/agent/METHOD.md §5).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);

let input = {};
try {
  input = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
} catch {
  input = {};
}

const limits = input.rate_limits ?? {};
const pct = (window) =>
  typeof window?.used_percentage === 'number' ? window.used_percentage : null;

const snapshot = {
  ts: new Date().toISOString(),
  session_id: input.session_id ?? null,
  model: input.model?.id ?? input.model?.display_name ?? null,
  five_hour: { used_percentage: pct(limits.five_hour), resets_at: limits.five_hour?.resets_at ?? null },
  seven_day: { used_percentage: pct(limits.seven_day), resets_at: limits.seven_day?.resets_at ?? null },
};

try {
  const here = dirname(fileURLToPath(import.meta.url));
  writeFileSync(join(here, 'usage.json'), JSON.stringify(snapshot, null, 2));
} catch {
  // The status line must never fail because the file could not be written.
}

const show = (value) => (value === null ? '—' : `${Math.round(value)}%`);
process.stdout.write(
  `5h ${show(snapshot.five_hour.used_percentage)} · 7d ${show(snapshot.seven_day.used_percentage)}`,
);
