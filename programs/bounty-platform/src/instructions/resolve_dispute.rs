use crate::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(bounty_id: u64, approve: bool)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub moderator: Signer<'info>,

    #[account(
        mut,
        seeds = [BOUNTY_SEED, bounty.creator.as_ref(), &bounty.bounty_id.to_le_bytes()],
        bump = bounty.bump,
    )]
    pub bounty: Account<'info, Bounty>,

    /// CHECK: escrow vault — system PDA for SOL, or ATA for SPL tokens
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CHECK: recipient — worker (if approved) or creator (if rejected)
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ResolveDispute>, _bounty_id: u64, approve: bool) -> Result<()> {
    let bounty_info = ctx.accounts.bounty.to_account_info();
    let bounty = &mut ctx.accounts.bounty;

    require!(
        bounty.status == BountyStatus::Disputed,
        BountyError::InvalidStateTransition
    );
    require!(
        ctx.accounts.moderator.key() == bounty.moderator,
        BountyError::NotModerator
    );

    let reward_per_winner = bounty.amount / (bounty.max_winners as u64);
    let already_paid = reward_per_winner * (bounty.winners_selected as u64);
    let remaining = bounty.amount.saturating_sub(already_paid);

    let bounty_key = bounty.key();

    if !approve {
        // Refund remaining to creator
        require_keys_eq!(
            ctx.accounts.recipient.key(),
            bounty.creator,
            BountyError::InvalidRecipient
        );
    }

    if bounty.token_mint == SOL_MINT {
        let vault_pda = Pubkey::find_program_address(
            &[bounty_key.as_ref(), VAULT_SEED],
            ctx.program_id,
        ).0;
        require_keys_eq!(
            ctx.accounts.vault.key(),
            vault_pda,
            BountyError::InvalidVault
        );

        let vault_bump = Pubkey::find_program_address(
            &[bounty_key.as_ref(), VAULT_SEED],
            ctx.program_id,
        ).1;
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
                    to: ctx.accounts.recipient.to_account_info(),
                },
                &[&vault_signer[..]],
            ),
            remaining,
        )?;
    } else {
        let vault_ata = anchor_spl::associated_token::get_associated_token_address(
            &bounty_key,
            &bounty.token_mint,
        );
        require_keys_eq!(
            ctx.accounts.vault.key(),
            vault_ata,
            BountyError::InvalidVault
        );

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
                    to: ctx.accounts.recipient.to_account_info(),
                    authority: bounty_info,
                },
                &[&bounty_signer[..]],
            ),
            remaining,
        )?;
    }

    bounty.status = if approve {
        BountyStatus::Completed
    } else {
        BountyStatus::Expired
    };

    emit!(DisputeResolvedEvent {
        bounty: bounty.key(),
        approve,
        recipient: ctx.accounts.recipient.key(),
        amount: remaining,
    });

    Ok(())
}
