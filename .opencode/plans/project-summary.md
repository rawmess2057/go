# Bounty Platform — Project Summary

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Solana Devnet                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Program: bounty_platform                  │  │
│  │  ID: 7WsPtEhY89n4yj9GshwQNgqQDGfUUdvonSto │  │
│  │  Instructions: create, submit, select,      │  │
│  │  reject, dispute, resolve, refund           │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
                        ▲
                    RPC (devnet)
                        │
┌──────────────────────────────────────────────────┐
│  Frontend: Next.js 16 + Tailwind v4              │
│  Hosted on Vercel / VPS                          │
│                                                   │
│  Key libs: Anchor (0.32), @solana/web3.js,       │
│  framer-motion, recharts, lucide-react,           │
│  react-hot-toast, next-themes, canvas-confetti    │
└──────────────────────────────────────────────────┘
```

## What's Shipped (All 4 Phases Complete)

### Phase 1 — Visual Overhaul
- Dark/light mode via `next-themes`
- Glassmorphism header + mobile bottom nav
- Redesigned BountyCard, SkeletonCard, EmptyState, StatsCard
- BountyDetail with gradient banner, timeline, confetti on win
- Page transitions with framer-motion

### Phase 2 — Feed & Discovery
- Debounced SearchBar (300ms)
- SortDropdown (reward, newest, deadline)
- Sidebar (highest value + top creators)
- TrendingBounties carousel
- Load-more pagination

### Phase 3 — Social & Identity
- UserAvatar (Dicebear identicon from pubkey)
- Profile pages (`/profile/[pubkey]`)
- Public submissions gallery on BountyDetail
- Leaderboard page (top earners + top creators)

### Phase 4 — Dashboard & Polish
- ActivityChart (recharts, 30d created vs completed)
- RecentActivity feed
- NotificationBell (Lucide icons, localStorage-persisted)
- Custom 404 page
- i18n: English + Nepali

## Key Files

| File | Purpose |
|------|---------|
| `programs/bounty-platform/src/lib.rs` | Solana program (7 instructions) |
| `Anchor.toml` | Anchor config — cluster: Devnet |
| `frontend/src/lib/constants.ts` | Program ID, addresses, constants |
| `frontend/src/components/AppWalletProvider.tsx` | RPC endpoint, wallet adapter setup |
| `frontend/src/hooks/useBounties.ts` | Fetch all bounties from chain |
| `frontend/src/hooks/useSubmissions.ts` | Fetch submissions per bounty |
| `frontend/src/components/BountyDetail.tsx` | Main interaction view |
| `frontend/messages/en.json` | English i18n |
| `frontend/messages/ne.json` | Nepali i18n |

## Deployment

See `deploy-staging.md` for full plan. TL;DR:
1. `anchor deploy` — deploys program to devnet
2. `npm run build && npm start` or `npx vercel` — deploys frontend
3. Optional: upgrade RPC from public devnet to Helius/QuickNode

## Quick Commands

```bash
# Root — program
anchor build              # Build Solana program
anchor deploy             # Deploy to devnet
anchor test               # Run integration tests

# Frontend
cd frontend && npm run dev    # Local dev server
cd frontend && npm run build  # Production build
cd frontend && npm start      # Serve production build
```
