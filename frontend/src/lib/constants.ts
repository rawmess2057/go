import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

export const PROGRAM_ID = new PublicKey(
  "7WsPtEhY89n4yj9GshwQNgqQDGfUUdvonSto3XFVGwgQ"
);
export const SOL_MINT = new PublicKey("11111111111111111111111111111111");
export const BOUNTY_SEED = Buffer.from("bounty");
export const VAULT_SEED = Buffer.from("vault");
export const SUBMISSION_SEED = Buffer.from("submission");
export const MIN_DEADLINE_SECONDS = 3600;

export function bountyAddress(
  creator: PublicKey,
  id: BN
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [BOUNTY_SEED, creator.toBuffer(), id.toArrayLike(Buffer, "le", 8)],
    PROGRAM_ID
  );
}

export function vaultAddress(bountyPda: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [bountyPda.toBuffer(), VAULT_SEED],
    PROGRAM_ID
  );
}

export function submissionAddress(
  bountyPda: PublicKey,
  worker: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SUBMISSION_SEED, bountyPda.toBuffer(), worker.toBuffer()],
    PROGRAM_ID
  );
}

export enum BountyStatus {
  Open = 0,
  Submitted = 1,
  WinnerSelected = 2,
  Completed = 3,
  Disputed = 4,
  Expired = 5,
}
