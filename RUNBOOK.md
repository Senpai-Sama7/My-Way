# Operations Runbook

## Health Checks
- `GET /api/health`: quick status
- `GET /api/health?deep=1`: verifies DB + LLM connectivity

## Common Failures
### LLM timeout or empty responses
- Verify `LLM_BASE_URL` and `LLM_MODEL` in `.env.local` or environment variables.
- Ensure the LLM server is running and can respond to a simple prompt.
- Check `/api/health?deep=1` for error details.

### PDF analysis fails
- Ensure the PDF is <= 12MB and has real text content.
- For URL uploads, confirm the URL is public and returns a PDF.

### TTS fails
- Confirm `espeak-ng` is installed and on `PATH`.
- Retry `/api/tts` with a small input (< 20k chars).

## Data & Backups
- Local dev: SQLite at `db/custom.db`
- Production: recommend managed Postgres + daily backups

## Logs
- Next server logs to `dev.log` and `server.log`
- For deeper diagnostics, add a log aggregator (ELK, Datadog, etc.)
