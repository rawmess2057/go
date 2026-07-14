import { PublicKey } from "@solana/web3.js";
import { SOL_MINT } from "@/lib/constants";

export interface TokenOption {
  mint: PublicKey;
  symbol: string;
  decimals: number;
  balance?: number;
}

export const DEFAULT_TOKEN: TokenOption = {
  mint: SOL_MINT,
  symbol: "SOL",
  decimals: 9,
};

export interface GigCreateData {
  title: string;
  description: string;
  selectedTags: string[];
  referenceUri: string;
  thumbnailUri: string;
  amount: string;
  selectedToken: TokenOption;
  maxWinners: string;
  deadlineDays: string;
  moderator: string;
}

export interface ValidationErrors {
  title?: string;
  description?: string;
  selectedTags?: string;
  referenceUri?: string;
  thumbnailUri?: string;
  amount?: string;
  maxWinners?: string;
  deadlineDays?: string;
  moderator?: string;
}
