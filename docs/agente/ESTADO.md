# Estado

_Actualizado: 2026-11-15, cierre de T-000._

## Siguiente tarea

**T-001 — Sitio de documentación del sistema** · modelo **Opus** · esfuerzo **medium** · encargo en `tareas/T-001.md`.

Después, en este orden: T-003 (Sonnet · medium) → T-002 (Fable · high) → T-004 (Sonnet · medium) → T-005 (Sonnet · medium) → T-100 (Fable · high).

## Hito actual

H0 — Método y documentación base. Ver `PLAN.md`.

## A medias

Nada.

## Consultas abiertas al creador

C-01 (qué se pide a un invitado al unirse) y C-02 (forma del grupo familiar privado): no bloquean hasta H3 y H8. Detalle en `DECISIONES.md`.

## Avisos para la próxima sesión

- Comprobar si existe `.claude/usage.json` en la raíz del workspace y si su `ts` es reciente: indica si la medición automática de consumo funciona en la extensión de VS Code. Si no existe, anotarlo aquí y pedir `/usage` al creador en las pausas.
- El workspace es un repo git local sin remoto hasta que el creador lo cree (`PENDIENTES_CREADOR.md` P-01): hacer commit igualmente; `git push` solo si `git remote` devuelve algo.
- Pruebas del backend con base de datos: requieren `docker compose up -d postgres` y las variables `TEST_DATABASE_*`; sin ellas esas pruebas se saltan. No se han ejecutado en esta máquina todavía.
