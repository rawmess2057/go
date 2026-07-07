use crate::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct RefundExpired<'info> {
    /// CHECK: anyone can trigger this
    pub caller: Signer<'info>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED, bounty.creator.as_ref(), &bounty.bounty_id.to_le_bytes()],
        bump = bounty.bump,
    )]
    pub bounty: Account<'info, Bounty>,

    /// CHECK: escrow vault — system PDA for SOL, or ATA for SPL tokens
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CHECK: creator's system account or token ATA (receives refund)
    #[account(mut)]
    pub creator_recipient: UncheckedAccount<'info>,

    pub clock: Sysvar<'info, Clock>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RefundExpired>, _bounty_id: u64) -> Result<()> {
    let bounty_info = ctx.accounts.bounty.to_account_info();
    let bounty = &mut ctx.accounts.bounty;
    let clock = &ctx.accounts.clock;

    require!(
        bounty.status == BountyStatus::Open
            || bounty.status == BountyStatus::Submitted
            || bounty.status == BountyStatus::WinnerSelected,
        BountyError::InvalidStateTransition
    );
    require!(
        clock.unix_timestamp >= bounty.deadline,
        BountyError::NotExpired
    );

    let reward_per_winner = bounty.amount / (bounty.max_winners as u64);
    let already_paid = reward_per_winner * (bounty.winners_selected as u64);
    let remaining = bounty.amount.saturating_sub(already_paid);

    let bounty_key = bounty.key();
    let vault_bump = Pubkey::find_program_address(
        &[bounty_key.as_ref(), VAULT_SEED],
        ctx.program_id,
    ).1;

    if bounty.token_mint == SOL_MINT {
        let vault_signer = &[
            bounty_key.as_ref(),
            VAULT_SEED,
            &[vault_bump],
        ];
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.key(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.creator_recipient.to_account_info(),
                },
                &[&vault_signer[..]],
            ),
            remaining,
        )?;
    } else {
        let bounty_signer = &[
            BOUNTY_SEED,
            bounty.creator.as_ref(),
            &bounty.bounty_id.to_le_bytes(),
            &[bounty.bump],
        ];
        anchor_spl::token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.key(),
                anchor_spl::token::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.creator_recipient.to_account_info(),
                    authority: bounty_info,
                },
                &[&bounty_signer[..]],
            ),
            remaining,
        )?;
    }

    bounty.status = BountyStatus::Expired;

    emit!(BountyRefundedEvent {
        bounty: bounty.key(),
        creator: bounty.creator,
        refund_amount: remaining,
    });

    Ok(())
}
