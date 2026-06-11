# Sina Port v2

New M2 app: per-role dashboards + KPI Dictionary editor + customer forms, built against the production Supabase project.

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS
- React Router (auth flow + public form routes)
- Supabase JS v2 (auth, queries, RLS)
- React Query (queryable cache, lighter than redux here)

## Routes
| Path | Auth | Audience |
|---|---|---|
| `/` | redirects by role | All authenticated |
| `/signin` | none | All |
| `/setter` | Setter dept | Setter dashboard |
| `/closer` | Closer dept | Closer dashboard |
| `/sm` | Delivery dept | Success Manager dashboard |
| `/ea` | Admin dept | EA / Operations dashboard |
| `/kpis` | All authenticated | KPI Dictionary (editor for Admin, read-only otherwise) |
| `/wins` | none (public) | Customer Wins submission form |
| `/audit/gm3` | none (public) | Brand Audit form for GM 3.0 program |
| `/audit/gptby` | none (public) | Brand Audit form for GPTBY Sprint program |

## Local dev

```bash
cp .env.example .env
# Edit .env: paste the anon key from Supabase project settings
npm install
npm run dev
```

Open http://localhost:5173.

## Deploy notes
- Lovable will pick this repo up directly; push to `main` triggers their build.
- Set `VITE_SUPABASE_ANON_KEY` in Lovable env vars.
- RLS is enforced server-side (Migration 009), so the anon key is safe to ship.

## Data layer
The app reads from views defined in Migration 012 (`engine.v_*_dashboard`, `engine.v_*_recent_*` etc.). These views inherit RLS from underlying tables - the calling user only sees rows they're authorized for, with no extra client-side logic.

## NOT shipped to client yet
Per the no-preview rule, this app is not shared with Khryzl until it's fully live. Internal staging + smoke tests first.
