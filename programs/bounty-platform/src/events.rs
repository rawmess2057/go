use crate::*;

#[event]
pub struct BountyCreatedEvent {
    pub bounty: Pubkey,
    pub creator: Pubkey,
    pub moderator: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub deadline: i64,
    pub max_winners: u8,
    pub title: String,
}

#[event]
pub struct SubmissionEvent {
    pub bounty: Pubkey,
    pub worker: Pubkey,
    pub uri: String,
}

#[event]
pub struct WinnerSelectedEvent {
    pub bounty: Pubkey,
    pub worker: Pubkey,
    pub reward: u64,
    pub winners_selected: u8,
    pub max_winners: u8,
}

#[event]
pub struct SubmissionRejectedEvent {
    pub bounty: Pubkey,
    pub worker: Pubkey,
}

#[event]
pub struct DisputeRaisedEvent {
    pub bounty: Pubkey,
    pub raised_by: Pubkey,
}

#[event]
pub struct DisputeResolvedEvent {
    pub bounty: Pubkey,
    pub approve: bool,
    pub recipient: Pubkey,
    pub amount: u64,
}

#[event]
pub struct BountyRefundedEvent {
    pub bounty: Pubkey,
    pub creator: Pubkey,
    pub refund_amount: u64,
}

#[event]
pub struct BountyClosedEvent {
    pub bounty: Pubkey,
    pub closed_by: Pubkey,
}
