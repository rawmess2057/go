use crate::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct SelectWinner<'info> {
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
        constraint = !submission.selected @ BountyError::SubmissionAlreadySelected,
    )]
    pub submission: Account<'info, Submission>,

    /// CHECK: escrow vault — system PDA for SOL, or ATA for SPL tokens
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CHECK: recipient — winner's system account for SOL, ATA for SPL
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<SelectWinner>, _bounty_id: u64) -> Result<()> {
    let bounty_info = ctx.accounts.bounty.to_account_info();
    let bounty = &mut ctx.accounts.bounty;
    let submission = &mut ctx.accounts.submission;

    require!(
        bounty.status == BountyStatus::Submitted || bounty.status == BountyStatus::WinnerSelected,
        BountyError::InvalidStateTransition
    );
    require!(
        ctx.accounts.moderator.key() == bounty.moderator,
        BountyError::NotModerator
    );
    require!(
        bounty.winners_selected < bounty.max_winners,
        BountyError::MaxWinnersReached
    );

    let reward_per_winner = bounty.amount / (bounty.max_winners as u64);
    require!(reward_per_winner > 0, BountyError::InvalidAmount);

    let bounty_key = bounty.key();

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
        require_keys_eq!(
            ctx.accounts.recipient.key(),
            submission.worker,
            BountyError::InvalidRecipient
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
            reward_per_winner,
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
        let recipient_ata = anchor_spl::associated_token::get_associated_token_address(
            &submission.worker,
            &bounty.token_mint,
        );
        require_keys_eq!(
            ctx.accounts.recipient.key(),
            recipient_ata,
            BountyError::InvalidRecipient
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
            reward_per_winner,
        )?;
    }

    submission.selected = true;
    bounty.winners_selected += 1;
    bounty.submission_uri = String::new();

    if bounty.winners_selected >= bounty.max_winners {
        bounty.status = BountyStatus::Completed;
    } else {
        bounty.status = BountyStatus::WinnerSelected;
    }

    emit!(WinnerSelectedEvent {
        bounty: bounty.key(),
        worker: ctx.accounts.recipient.key(),
        reward: reward_per_winner,
        winners_selected: bounty.winners_selected,
        max_winners: bounty.max_winners,
    });

    Ok(())
}
