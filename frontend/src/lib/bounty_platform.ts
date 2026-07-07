/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bounty_platform.json`.
 */
export type BountyPlatform = {
  "address": "7WsPtEhY89n4yj9GshwQNgqQDGfUUdvonSto3XFVGwgQ",
  "metadata": {
    "name": "bountyPlatform",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "closeBounty",
      "discriminator": [
        90,
        33,
        205,
        110,
        210,
        22,
        247,
        49
      ],
      "accounts": [
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createBounty",
      "discriminator": [
        122,
        90,
        14,
        143,
        8,
        125,
        200,
        2
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "bountyId"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true,
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        },
        {
          "name": "moderator",
          "type": "pubkey"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "deadline",
          "type": "i64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "referenceUri",
          "type": "string"
        },
        {
          "name": "thumbnailUri",
          "type": "string"
        },
        {
          "name": "maxWinners",
          "type": "u8"
        }
      ]
    },
    {
      "name": "raiseDispute",
      "discriminator": [
        41,
        243,
        1,
        51,
        150,
        95,
        246,
        73
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "refundExpired",
      "discriminator": [
        118,
        153,
        164,
        244,
        40,
        128,
        242,
        250
      ],
      "accounts": [
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "creatorRecipient",
          "writable": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "rejectSubmission",
      "discriminator": [
        2,
        92,
        1,
        81,
        148,
        156,
        6,
        160
      ],
      "accounts": [
        {
          "name": "moderator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "submission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "bounty"
              },
              {
                "kind": "account",
                "path": "submission.worker",
                "account": "submission"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveDispute",
      "discriminator": [
        231,
        6,
        202,
        6,
        96,
        103,
        12,
        230
      ],
      "accounts": [
        {
          "name": "moderator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        },
        {
          "name": "approve",
          "type": "bool"
        }
      ]
    },
    {
      "name": "selectWinner",
      "discriminator": [
        119,
        66,
        44,
        236,
        79,
        158,
        82,
        51
      ],
      "accounts": [
        {
          "name": "moderator",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "submission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "bounty"
              },
              {
                "kind": "account",
                "path": "submission.worker",
                "account": "submission"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "recipient",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "submitCompletion",
      "discriminator": [
        155,
        236,
        211,
        88,
        53,
        120,
        74,
        196
      ],
      "accounts": [
        {
          "name": "worker",
          "writable": true,
          "signer": true
        },
        {
          "name": "bounty",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  117,
                  110,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "bounty.creator",
                "account": "bounty"
              },
              {
                "kind": "account",
                "path": "bounty.bounty_id",
                "account": "bounty"
              }
            ]
          }
        },
        {
          "name": "submission",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "bounty"
              },
              {
                "kind": "account",
                "path": "worker"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bountyId",
          "type": "u64"
        },
        {
          "name": "submissionUri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bounty",
      "discriminator": [
        237,
        16,
        105,
        198,
        19,
        69,
        242,
        234
      ]
    },
    {
      "name": "submission",
      "discriminator": [
        58,
        194,
        159,
        158,
        75,
        102,
        178,
        197
      ]
    }
  ],
  "events": [
    {
      "name": "bountyClosedEvent",
      "discriminator": [
        126,
        88,
        250,
        4,
        194,
        49,
        99,
        114
      ]
    },
    {
      "name": "bountyCreatedEvent",
      "discriminator": [
        38,
        84,
        95,
        56,
        81,
        242,
        52,
        88
      ]
    },
    {
      "name": "bountyRefundedEvent",
      "discriminator": [
        86,
        149,
        22,
        251,
        202,
        144,
        45,
        110
      ]
    },
    {
      "name": "disputeRaisedEvent",
      "discriminator": [
        89,
        136,
        174,
        60,
        243,
        203,
        120,
        85
      ]
    },
    {
      "name": "disputeResolvedEvent",
      "discriminator": [
        152,
        37,
        98,
        245,
        229,
        39,
        150,
        78
      ]
    },
    {
      "name": "submissionEvent",
      "discriminator": [
        86,
        48,
        42,
        186,
        35,
        49,
        231,
        54
      ]
    },
    {
      "name": "submissionRejectedEvent",
      "discriminator": [
        27,
        147,
        78,
        232,
        31,
        194,
        87,
        184
      ]
    },
    {
      "name": "winnerSelectedEvent",
      "discriminator": [
        88,
        68,
        76,
        70,
        235,
        254,
        7,
        92
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidStateTransition",
      "msg": "Bounty not in the required state for this operation"
    },
    {
      "code": 6001,
      "name": "deadlinePassed",
      "msg": "Deadline has already passed"
    },
    {
      "code": 6002,
      "name": "deadlineTooSoon",
      "msg": "Deadline must be at least 1 hour in the future"
    },
    {
      "code": 6003,
      "name": "invalidAmount",
      "msg": "Reward amount must be greater than zero"
    },
    {
      "code": 6004,
      "name": "notCreator",
      "msg": "Only the bounty creator can perform this action"
    },
    {
      "code": 6005,
      "name": "notModerator",
      "msg": "Only the moderator can perform this action"
    },
    {
      "code": 6006,
      "name": "emptySubmissionUri",
      "msg": "Submission URI cannot be empty"
    },
    {
      "code": 6007,
      "name": "notExpired",
      "msg": "Bounty has not expired yet"
    },
    {
      "code": 6008,
      "name": "insufficientVaultBalance",
      "msg": "Insufficient balance in the vault"
    },
    {
      "code": 6009,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic operation overflowed"
    },
    {
      "code": 6010,
      "name": "emptyTitle",
      "msg": "Title cannot be empty"
    },
    {
      "code": 6011,
      "name": "titleTooLong",
      "msg": "Title exceeds maximum length"
    },
    {
      "code": 6012,
      "name": "descriptionTooLong",
      "msg": "Description exceeds maximum length"
    },
    {
      "code": 6013,
      "name": "invalidMaxWinners",
      "msg": "Max winners must be greater than zero"
    },
    {
      "code": 6014,
      "name": "maxWinnersReached",
      "msg": "All winners have already been selected"
    },
    {
      "code": 6015,
      "name": "referenceUriTooLong",
      "msg": "Reference URI exceeds maximum length"
    },
    {
      "code": 6016,
      "name": "thumbnailUriTooLong",
      "msg": "Thumbnail URI exceeds maximum length"
    },
    {
      "code": 6017,
      "name": "submissionAlreadySelected",
      "msg": "This submission has already been selected as a winner"
    },
    {
      "code": 6018,
      "name": "creatorCannotSubmit",
      "msg": "The bounty creator cannot submit work to their own bounty"
    },
    {
      "code": 6019,
      "name": "moderatorCannotSubmit",
      "msg": "The moderator cannot submit work to a bounty they moderate"
    }
  ],
  "types": [
    {
      "name": "bounty",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "moderator",
            "type": "pubkey"
          },
          {
            "name": "bountyId",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "referenceUri",
            "type": "string"
          },
          {
            "name": "thumbnailUri",
            "type": "string"
          },
          {
            "name": "submissionUri",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "bountyStatus"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "maxWinners",
            "type": "u8"
          },
          {
            "name": "winnersSelected",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "bountyClosedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "closedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "bountyCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "moderator",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          },
          {
            "name": "maxWinners",
            "type": "u8"
          },
          {
            "name": "title",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "bountyRefundedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "refundAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bountyStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "open"
          },
          {
            "name": "submitted"
          },
          {
            "name": "winnerSelected"
          },
          {
            "name": "completed"
          },
          {
            "name": "disputed"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "disputeRaisedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "raisedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "disputeResolvedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "approve",
            "type": "bool"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "submission",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "worker",
            "type": "pubkey"
          },
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "submittedAt",
            "type": "i64"
          },
          {
            "name": "selected",
            "type": "bool"
          },
          {
            "name": "rejected",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "submissionEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "worker",
            "type": "pubkey"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "submissionRejectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "worker",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "winnerSelectedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bounty",
            "type": "pubkey"
          },
          {
            "name": "worker",
            "type": "pubkey"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "winnersSelected",
            "type": "u8"
          },
          {
            "name": "maxWinners",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
