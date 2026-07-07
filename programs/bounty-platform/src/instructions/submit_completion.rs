use crate::*;

#[derive(Accounts)]
#[instruction(bounty_id: u64, submission_uri: String)]
pub struct SubmitCompletion<'info> {
    #[account(mut)]
    pub worker: Signer<'info>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED, bounty.creator.as_ref(), &bounty.bounty_id.to_le_bytes()],
        bump = bounty.bump,
    )]
    pub bounty: Account<'info, Bounty>,

    #[account(
        init_if_needed,
        payer = worker,
        space = 8 + Submission::INIT_SPACE,
        seeds = [SUBMISSION_SEED, bounty.key().as_ref(), worker.key().as_ref()],
        bump
    )]
    pub submission: Account<'info, Submission>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubmitCompletion>, _bounty_id: u64, submission_uri: String) -> Result<()> {
    let clock = Clock::get()?;
    let bounty = &mut ctx.accounts.bounty;

    require!(
        ctx.accounts.worker.key() != bounty.creator,
        BountyError::CreatorCannotSubmit
    );
    require!(
        ctx.accounts.worker.key() != bounty.moderator,
        BountyError::ModeratorCannotSubmit
    );
    require!(
        bounty.status == BountyStatus::Open
            || bounty.status == BountyStatus::Submitted
            || bounty.status == BountyStatus::WinnerSelected,
        BountyError::InvalidStateTransition
    );
    require!(!submission_uri.is_empty(), BountyError::EmptySubmissionUri);

    let submission = &mut ctx.accounts.submission;
    submission.worker = ctx.accounts.worker.key();
    submission.bounty = bounty.key();
    submission.uri = submission_uri.clone();
    submission.submitted_at = clock.unix_timestamp;
    submission.selected = false;
    submission.bump = ctx.bumps.submission;

    if bounty.status == BountyStatus::Open {
        bounty.status = BountyStatus::Submitted;
    }
    bounty.submission_uri = submission_uri;

    Ok(())
}
