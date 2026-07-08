# Staging / Devnet Deployment Plan

## Environment Overview

| Component | Current Config | Target |
|-----------|---------------|--------|
| **Solana Cluster** | Devnet | Devnet (no change) |
| **RPC Endpoint** | Hardcoded `https://api.devnet.solana.com` | Keep or upgrade to Helius/QuickNode |
| **Program ID** | `7WsPtEhY89n4yj9GshwQNgqQDGfUUdvonSto3XFVGwgQ` | Already deployed? |
| **Frontend Host** | None yet | VPS or Vercel |

## Step 1 — Deploy the Solana Program

```bash
# From project root
anchor deploy
```

**Prerequisites:**
- `~/.config/solana/id.json` exists (your deployer keypair)
- Keypair has devnet SOL — if not:
  ```bash
  solana airdrop 5 --url devnet
  ```
- Anchor CLI installed (`anchor --version`)

**What happens:** Anchor reads `Anchor.toml`, finds cluster = `Devnet` and program ID = `7WsPtEhY89n4yj9GshwQNgqQDGfUUdvonSto3XFVGwgQ`, builds and uploads the BPF to devnet.

**Verify:**
```bash
solana program show 7WsPtEhY89n4yj9GshwQNgqQDGfUUdvonSto3XFVGwgQ --url devnet
```
Should show the program with a valid deployment slot and authority.

## Step 2 — Upgrade RPC (Optional but Recommended)

Public devnet RPC (`api.devnet.solana.com`) is rate-limited and slow. For a staging environment:

1. Create `frontend/.env.local`:
   ```
   NEXT_PUBLIC_RPC_URL=https://rpc.helius.xyz/?api-key=YOUR_KEY
   ```
2. Update `frontend/src/components/AppWalletProvider.tsx`:
   ```tsx
   const endpoint = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
   ```

This is the **only code change** needed — the program ID `constants.ts` already matches what's deployed.

## Step 3 — Deploy the Frontend

### Option A: VPS (Droplet/EC2)

```bash
cd frontend
npm run build
npm start       # serves on port 3000
```

Add a reverse proxy (nginx/Caddy) for SSL + custom domain if needed.

### Option B: Vercel (Easiest)

```bash
cd frontend
npx vercel --prod
```

One command. Auto-detects Next.js. No configuration needed.

## Summary of Required Actions

| # | Action | Time | Risk |
|---|--------|------|------|
| 1 | `anchor deploy` | ~2 min | Low — program unchanged |
| 2 | (Optional) Add RPC env var + update provider | ~5 min | None |
| 3 | `npm run build && npm start` or `npx vercel` | ~2 min | None |

**Total time:** ~5-10 minutes. No code changes to business logic, no migration scripts, no database setup.

## Rollback

- **Program:** `anchor deploy` with a prior build, or `solana program close` (closes and refunds rent)
- **Frontend:** Vercel instant rollback in dashboard, or re-deploy previous build on VPS
