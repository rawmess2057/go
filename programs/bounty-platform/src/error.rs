use anchor_lang::prelude::*;

#[error_code]
pub enum BountyError {
    #[msg("Bounty not in the required state for this operation")]
    InvalidStateTransition,
    #[msg("Deadline has already passed")]
    DeadlinePassed,
    #[msg("Deadline must be at least 1 hour in the future")]
    DeadlineTooSoon,
    #[msg("Reward amount must be greater than zero")]
    InvalidAmount,
    #[msg("Only the bounty creator can perform this action")]
    NotCreator,
    #[msg("Only the moderator can perform this action")]
    NotModerator,
    #[msg("Submission URI cannot be empty")]
    EmptySubmissionUri,
    #[msg("Bounty has not expired yet")]
    NotExpired,
    #[msg("Insufficient balance in the vault")]
    InsufficientVaultBalance,
    #[msg("Arithmetic operation overflowed")]
    ArithmeticOverflow,
    #[msg("Title cannot be empty")]
    EmptyTitle,
    #[msg("Title exceeds maximum length")]
    TitleTooLong,
    #[msg("Description exceeds maximum length")]
    DescriptionTooLong,
    #[msg("Max winners must be greater than zero")]
    InvalidMaxWinners,
    #[msg("All winners have already been selected")]
    MaxWinnersReached,
    #[msg("Reference URI exceeds maximum length")]
    ReferenceUriTooLong,
    #[msg("Thumbnail URI exceeds maximum length")]
    ThumbnailUriTooLong,
    #[msg("This submission has already been selected as a winner")]
    SubmissionAlreadySelected,
    #[msg("The bounty creator cannot submit work to their own bounty")]
    CreatorCannotSubmit,
    #[msg("The moderator cannot submit work to a bounty they moderate")]
    ModeratorCannotSubmit,
    #[msg("Recipient account does not match the expected party")]
    InvalidRecipient,
    #[msg("Vault account does not match the expected PDA or ATA")]
    InvalidVault,
    #[msg("Cannot resubmit after a winner has been selected")]
    CannotResubmitAfterSelection,
}
