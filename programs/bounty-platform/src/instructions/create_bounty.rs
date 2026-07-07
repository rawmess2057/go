use crate::*;
use anchor_spl::token::Token;

#[derive(Accounts)]
#[instruction(bounty_id: u64)]
pub struct CreateBounty<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + Bounty::INIT_SPACE,
        seeds = [BOUNTY_SEED, creator.key().as_ref(), &bounty_id.to_le_bytes()],
        bump
    )]
    pub bounty: Account<'info, Bounty>,

    /// CHECK: escrow vault — system PDA for SOL, or ATA for SPL tokens
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CHECK: creator's token account (required for SPL, ignored for SOL)
    #[account(mut)]
    pub creator_token_account: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(
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
    let clock = Clock::get()?;
    let bounty = &mut ctx.accounts.bounty;

    require!(amount > 0, BountyError::InvalidAmount);
    require!(
        deadline > clock.unix_timestamp + MIN_DEADLINE_SECONDS,
        BountyError::DeadlineTooSoon
    );
    require!(!title.is_empty(), BountyError::EmptyTitle);
    require!(title.len() <= 50, BountyError::TitleTooLong);
    require!(description.len() <= 500, BountyError::DescriptionTooLong);
    require!(reference_uri.len() <= 200, BountyError::ReferenceUriTooLong);
    require!(thumbnail_uri.len() <= 200, BountyError::ThumbnailUriTooLong);
    require!(max_winners > 0, BountyError::InvalidMaxWinners);

    bounty.creator = ctx.accounts.creator.key();
    bounty.moderator = moderator;
    bounty.bounty_id = bounty_id;
    bounty.token_mint = token_mint;
    bounty.amount = amount;
    bounty.deadline = deadline;
    bounty.created_at = clock.unix_timestamp;
    bounty.title = title;
    bounty.description = description;
    bounty.reference_uri = reference_uri;
    bounty.thumbnail_uri = thumbnail_uri;
    bounty.submission_uri = String::new();
    bounty.status = BountyStatus::Open;
    bounty.bump = ctx.bumps.bounty;
    bounty.max_winners = max_winners;
    bounty.winners_selected = 0;

    let bounty_key = bounty.key();

    if token_mint == SOL_MINT {
        let vault_pda = Pubkey::find_program_address(
            &[bounty_key.as_ref(), VAULT_SEED],
            ctx.program_id,
        ).0;
        require_keys_eq!(
            ctx.accounts.vault.key(),
            vault_pda,
            BountyError::InvalidStateTransition
        );

        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.key(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.creator.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;
    } else {
        let creator_token = ctx.accounts.creator_token_account.as_ref()
            .ok_or(ProgramError::NotEnoughAccountKeys)?;

        let vault_ata = anchor_spl::associated_token::get_associated_token_address(
            &bounty_key,
            &token_mint,
        );
        require_keys_eq!(
            ctx.accounts.vault.key(),
            vault_ata,
            BountyError::InvalidStateTransition
        );

        anchor_spl::token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.key(),
                anchor_spl::token::Transfer {
                    from: creator_token.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            amount,
        )?;
    }

    emit!(BountyCreatedEvent {
        bounty: bounty_key,
        creator: bounty.creator,
        moderator: bounty.moderator,
        token_mint: bounty.token_mint,
        amount: bounty.amount,
        deadline: bounty.deadline,
        max_winners: bounty.max_winners,
        title: bounty.title.clone(),
    });

    Ok(())
}
