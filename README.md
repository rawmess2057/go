# Inaam

> Post Tasks. Get Work Done. Get Paid Instantly.
> 100% non-custodial escrow on Solana.

## Overview

Inaam is a peer-to-peer bounty platform built on Solana. Creators post tasks and lock funds in a program-derived escrow vault. Workers submit results. Moderators review submissions and resolve disputes. Payouts are instant and automatic — no middlemen, no delays.

## Features

- **Non-custodial escrow** — Funds are locked in a PDA vault. SOL and SPL tokens supported.
- **Moderated dispute resolution** — Each bounty has a moderator to fairly resolve disputes.
- **Multi-winner bounties** — Set a max number of winners for a single bounty.
- **Instant payouts** — Winner selection triggers automatic token transfer on Solana.
- **Deadline enforcement** — Expired bounties can be refunded to the creator.
- **i18n** — English and Nepali support.
- **Dark / light theme** — System-aware theming with next-themes.
- **Responsive design** — Mobile-first with a dedicated mobile nav.

## Architecture

| Layer | Technology |
|-------|-----------|
| **On-chain** | Anchor program (Rust) — 7 instructions, 2 account types, PDA-based escrow |
| **Off-chain** | Next.js 16, React 19, Tailwind CSS 4, Solana wallet-adapter |

## Tech Stack

- **Blockchain** — Solana, Anchor 1.0.2, anchor-spl, Rust
- **Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Recharts, lucide-react, react-hot-toast, canvas-confetti
- **Testing** — Mocha, Chai, LiteSVM
- **Tooling** — yarn, Prettier, ESLint

## Prerequisites

- Node.js >= 18
- yarn
- Solana CLI
- Anchor CLI (v0.32.x)

## Getting Started

```bash
git clone <repo-url>
cd bounty-platform
yarn install

# Build the Anchor program
anchor build

# Run tests
anchor test

# Start the frontend
cd frontend
yarn dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).

## Program Instructions

| Instruction | Description |
|---|---|
| `create_bounty` | Create a bounty with SOL or SPL token escrow |
| `submit_completion` | Submit completion work with a URI reference |
| `select_winner` | Mark a submission as the winner (triggers payout) |
| `reject_submission` | Reject a worker's submission |
| `raise_dispute` | Raise a dispute on a submission |
| `resolve_dispute` | Moderator resolves a dispute (approve / reject) |
| `refund_expired` | Refund the creator after the deadline has passed |

## Project Structure

```
├── programs/
│   └── bounty-platform/     # Anchor smart contract (Rust)
│       └── src/
│           ├── lib.rs        # Program entrypoint
│           ├── state.rs      # Bounty & Submission accounts
│           ├── instructions/ # Instruction handlers
│           ├── constants.rs  # Seed prefixes, SOL_MINT
│           └── error.rs      # Custom error codes
├── app/                      # Next.js frontend
│   └── frontend/
│       └── src/
│           ├── app/          # Pages & routing
│           ├── components/   # UI components
│           ├── hooks/        # React hooks (program, bounties, etc.)
│           └── lib/          # Constants, IDL, i18n
├── tests/                    # Mocha / Chai test suite
├── migrations/               # Anchor deploy script
├── Anchor.toml               # Anchor configuration
└── Cargo.toml                # Rust workspace
```

## Configuration

Cluster and wallet settings are in `Anchor.toml`. Default targets are **Devnet** and **Localnet**.

```toml
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

## Testing

```bash
anchor test
```

Tests cover the full lifecycle: create → submit → select winner → dispute → resolve → refund.

## License

ISC
