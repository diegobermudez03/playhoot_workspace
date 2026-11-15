// Barra de estado de Claude Code: muestra el consumo del plan y lo guarda en
// .claude/usage.json para que el agente pueda leerlo al inicio y al cierre de
// cada tramo de trabajo (docs/agente/METODO.md §5).
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
  // La barra de estado nunca debe fallar por no poder escribir.
}

const show = (value) => (value === null ? '—' : `${Math.round(value)}%`);
process.stdout.write(
  `5h ${show(snapshot.five_hour.used_percentage)} · 7d ${show(snapshot.seven_day.used_percentage)}`,
);
