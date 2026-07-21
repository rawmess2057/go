use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum BountyStatus {
    Open,
    Submitted,
    WinnerSelected,
    Completed,
    Disputed,
    Expired,
}

#[account]
#[derive(InitSpace)]
pub struct Submission {
    pub worker: Pubkey,
    pub bounty: Pubkey,
    #[max_len(200)]
    pub uri: String,
    pub submitted_at: i64,
    pub selected: bool,
    pub rejected: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub creator: Pubkey,
    pub moderator: Pubkey,
    pub bounty_id: u64,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub deadline: i64,
    pub created_at: i64,
    #[max_len(500)]
    pub title: String,
    #[max_len(8000)]
    pub description: String,
    #[max_len(200)]
    pub reference_uri: String,
    #[max_len(200)]
    pub thumbnail_uri: String,
    #[max_len(200)]
    pub submission_uri: String,
    pub status: BountyStatus,
    pub bump: u8,
    pub max_winners: u8,
    pub winners_selected: u8,
}
