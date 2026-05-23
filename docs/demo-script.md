# Demo Script

1. Run `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill keys only if testing real
   integrations.
3. Run `pnpm dev`.
4. Open `http://localhost:3000/requests`.
5. Use the seeded demo request or create a new request from `/requests/new`.
6. Generate analysis.
7. Open a scenario, toggle optional modules and verify that totals update.
8. Open preview and download the PDF.

Without external API keys, the app uses deterministic demo responses for
OpenRouter and ElevenLabs.
