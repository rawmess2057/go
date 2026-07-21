import { z } from "zod";
import { isValidUri, isValidImageUri } from "@/lib/validate";

const solanaPubKeyRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export const taskDetailsSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(500, "Title must be 500 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(8000, "Description must be 8000 characters or less"),
  selectedTags: z
    .array(z.string())
    .max(3, "Select up to 3 categories")
    .optional()
    .default([]),
  referenceUri: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => !val || isValidUri(val),
      "Must be a valid https://, ipfs://, or ar:// link"
    ),
  thumbnailUri: z
    .string()
    .optional()
    .default("")
    .refine(
      (val) => !val || isValidImageUri(val),
      "Must be a valid image URL"
    ),
});

export const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Reward amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  selectedToken: z.any(),
  maxWinners: z
    .string()
    .min(1, "Number of winners is required")
    .refine(
      (val) => {
        const n = parseInt(val, 10);
        return n >= 1 && n <= 10;
      },
      { message: "Must be between 1 and 10" }
    ),
  deadlineDays: z
    .string()
    .min(1, "Deadline is required")
    .refine(
      (val) => {
        const n = parseInt(val, 10);
        return n >= 1 && n <= 30;
      },
      { message: "Must be between 1 and 30 days" }
    ),
  moderator: z
    .string()
    .min(1, "Moderator wallet is required")
    .regex(solanaPubKeyRegex, "Invalid Solana public key format"),
});

export type TaskDetailsInput = z.infer<typeof taskDetailsSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
