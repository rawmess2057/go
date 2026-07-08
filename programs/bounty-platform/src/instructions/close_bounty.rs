use crate::*;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct CloseBounty<'info> {
    /// CHECK: anyone can trigger this (permissionless cleanup)
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED, bounty.creator.as_ref(), &bounty.bounty_id.to_le_bytes()],
        bump = bounty.bump,
        close = caller,
    )]
    pub bounty: Account<'info, Bounty>,
}

pub fn handler(ctx: Context<CloseBounty>, _bounty_id: u64) -> Result<()> {
    let bounty = &ctx.accounts.bounty;

    require!(
        bounty.status == BountyStatus::Completed || bounty.status == BountyStatus::Expired,
        BountyError::InvalidStateTransition
    );

    emit!(BountyClosedEvent {
        bounty: bounty.key(),
        closed_by: ctx.accounts.caller.key(),
    });

    Ok(())
}
