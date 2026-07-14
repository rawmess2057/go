pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use events::*;
pub use instructions::*;
pub use state::*;

declare_id!("CZvJ2JhfjYGvwUYzbaVj8JiydgEo82wKMvkx4fNurvq2");

#[program]
pub mod bounty_platform {
    use super::*;

    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        bounty_id: u64,
        moderator: Pubkey,
        token_mint: Pubkey,
        amount: u64,
        deadline: i64,
        title: String,
        description: String,
        reference_uri: String,
        thumbnail_uri: String,
        max_winners: u8,
    ) -> Result<()> {
        instructions::create_bounty::handler(
            ctx, bounty_id, moderator, token_mint, amount, deadline,
            title, description, reference_uri, thumbnail_uri, max_winners,
        )
    }

    pub fn submit_completion(
        ctx: Context<SubmitCompletion>,
        bounty_id: u64,
        submission_uri: String,
    ) -> Result<()> {
        instructions::submit_completion::handler(ctx, bounty_id, submission_uri)
    }

    pub fn select_winner(
        ctx: Context<SelectWinner>,
        bounty_id: u64,
    ) -> Result<()> {
        instructions::select_winner::handler(ctx, bounty_id)
    }

    pub fn reject_submission(
        ctx: Context<RejectSubmission>,
        bounty_id: u64,
    ) -> Result<()> {
        instructions::reject_submission::handler(ctx, bounty_id)
    }

    pub fn raise_dispute(
        ctx: Context<RaiseDispute>,
        bounty_id: u64,
    ) -> Result<()> {
        instructions::raise_dispute::handler(ctx, bounty_id)
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        bounty_id: u64,
        approve: bool,
    ) -> Result<()> {
        instructions::resolve_dispute::handler(ctx, bounty_id, approve)
    }

    pub fn refund_expired(
        ctx: Context<RefundExpired>,
        bounty_id: u64,
    ) -> Result<()> {
        instructions::refund_expired::handler(ctx, bounty_id)
    }

    pub fn close_bounty(
        ctx: Context<CloseBounty>,
        bounty_id: u64,
    ) -> Result<()> {
        instructions::close_bounty::handler(ctx, bounty_id)
    }
}
