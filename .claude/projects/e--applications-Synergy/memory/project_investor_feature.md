---
name: project-investor-feature
description: Investor dashboard feature built under src/app/investor/ — blue theme, 11 pages + login
metadata:
  type: project
---

Investor portal feature implemented at `src/app/investor/`.

**Why:** PRD requires 3 roles — Admin, Investor, UMKM. Investor feature built to match all 13 PRD features for the Investor role.

**How to apply:** When touching investor pages, session key is `synergy_investor_session` stored in sessionStorage. Login is OTP-based (phone number → 6-digit OTP). Blue theme uses gradient `linear-gradient(135deg, #1d4ed8, #0ea5e9)` via `layout.module.css`.

**Structure:**
- `/investor/login` — OTP login (2-step: phone → OTP)
- `/investor/dashboard` — portfolio summary (layout.tsx + layout.module.css + page.tsx + page.module.css)
- Sub-pages: `explore`, `ai-insight`, `investasi`, `akad`, `portfolio`, `monitoring`, `profit-sharing`, `risk-alert`, `riwayat`, `wallet`

**Database:** No new Prisma tables needed — all investor data covered by existing schema (InvestorProfile, Investment, ProfitSharing, Wallet, Transaction, Notification, Akad, Campaign).

All pages use mock/static data. Real DB integration pending.

[[project-admin-feature]]
