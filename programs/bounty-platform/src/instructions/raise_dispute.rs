use crate::*;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct RaiseDispute<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED, bounty.creator.as_ref(), &bounty.bounty_id.to_le_bytes()],
        bump = bounty.bump,
    )]
    pub bounty: Account<'info, Bounty>,
}

pub fn handler(ctx: Context<RaiseDispute>, _bounty_id: u64) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;

    require!(
        bounty.status == BountyStatus::WinnerSelected || bounty.status == BountyStatus::Submitted,
        BountyError::InvalidStateTransition
    );
    require!(
        ctx.accounts.signer.key() == bounty.creator,
        BountyError::NotCreator
    );

    bounty.status = BountyStatus::Disputed;

    emit!(DisputeRaisedEvent {
        bounty: bounty.key(),
        raised_by: ctx.accounts.signer.key(),
    });

    Ok(())
}
