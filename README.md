# InspectFlow

Production Next.js operations platform for multi-tenant inspection franchises.

## Routes
- `/dashboard`, `/admin`, `/fetch`
- `/enquiries/tb-yb`, `/enquiries/franchise`
- `/inspections/building-national`, `/inspections/building-franchise`
- `/inspections/pool-national`, `/inspections/pool-franchise`
- `/inspectors`, `/franchises`, `/storage`, `/campaigns`, `/referrals`, `/reviews`
- `/report-studio`, `/reports/IF-20841/preview?template=executive`
- `/quick-sms`, `/field`

## Local development
```bash
cp .env.example .env.local
npm install
npm run dev
```

OpenRouter AI, PDF extraction, TTS, Neon/Postgres and Blob credentials are server-side only.
