# Toobix Deployment Notes

- **Docker Compose** (`docker-compose.yml`):
  - `bun services/hardware-awareness-v2.ts` on `8940`
  - `bun services/unified-service-gateway.ts` on `9000` (uses `TOOBIX_API_KEY` if set, `TOOBIX_STORAGE=sqlite`)
  - optional `start-all` profile spins up demo stack.
  - Usage: `docker compose up toobix-hardware toobix-gateway` or `docker compose --profile all up`.

- **Security**:
  - Set `TOOBIX_API_KEY=<secret>` to require `x-toobix-key`/`Authorization: Bearer` on all routes except `/health`/`/openapi`.
  - Groq key stays in `.env` or `data/analytics/groq-api-key.txt`.

- **Persistence**:
  - Default `TOOBIX_STORAGE=sqlite` writes to `data/toobix.sqlite` (dreams, emotions, memories, gratitude, profile).
  - Falls back to JSON under `data/analytics/*` for compatibility.

- **Checks/CI**:
  - GitHub workflow `.github/workflows/check.yml` runs type checks + `bun test`.

- **Client Headers**:
  - Set `apiKey` when constructing `ToobixClient` to send `x-toobix-key`.
