use anchor_lang::prelude::*;

pub const SOL_MINT: Pubkey = Pubkey::new_from_array([0u8; 32]);

pub const BOUNTY_SEED: &[u8] = b"bounty";
pub const VAULT_SEED: &[u8] = b"vault";
pub const SUBMISSION_SEED: &[u8] = b"submission";
pub const MIN_DEADLINE_SECONDS: i64 = 3600;
