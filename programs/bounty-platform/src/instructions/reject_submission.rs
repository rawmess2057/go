use crate::*;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct RejectSubmission<'info> {
    #[account(mut)]
    pub moderator: Signer<'info>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED, bounty.creator.as_ref(), &bounty.bounty_id.to_le_bytes()],
        bump = bounty.bump,
    )]
    pub bounty: Account<'info, Bounty>,

    #[account(
        mut,
        seeds = [SUBMISSION_SEED, bounty.key().as_ref(), submission.worker.as_ref()],
        bump = submission.bump,
    )]
    pub submission: Account<'info, Submission>,
}

pub fn handler(ctx: Context<RejectSubmission>, _bounty_id: u64) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let submission = &mut ctx.accounts.submission;

    require!(
        bounty.status == BountyStatus::Submitted,
        BountyError::InvalidStateTransition
    );
    require!(
        ctx.accounts.moderator.key() == bounty.moderator,
        BountyError::NotModerator
    );

    submission.rejected = true;
    bounty.submission_uri = String::new();
    bounty.status = BountyStatus::Open;

    emit!(SubmissionRejectedEvent {
        bounty: bounty.key(),
        worker: submission.worker,
    });

    Ok(())
}
