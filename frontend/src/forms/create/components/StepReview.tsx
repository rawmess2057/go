"use client";

import { useMemo } from "react";
import { Copy, Warning, ArrowSquareOut } from "@phosphor-icons/react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";
import { TAGS } from "@/lib/tags";
import toast from "react-hot-toast";

export default function StepReview() {
  const title = useGigCreateStore((s) => s.title);
  const description = useGigCreateStore((s) => s.description);
  const selectedTags = useGigCreateStore((s) => s.selectedTags);
  const referenceUri = useGigCreateStore((s) => s.referenceUri);
  const thumbnailUri = useGigCreateStore((s) => s.thumbnailUri);
  const amount = useGigCreateStore((s) => s.amount);
  const selectedToken = useGigCreateStore((s) => s.selectedToken);
  const maxWinners = useGigCreateStore((s) => s.maxWinners);
  const deadlineDays = useGigCreateStore((s) => s.deadlineDays);
  const moderator = useGigCreateStore((s) => s.moderator);

  const endDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + parseInt(deadlineDays));
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [deadlineDays]);

  const perWinner =
    parseFloat(amount) && parseInt(maxWinners) > 0
      ? (parseFloat(amount) / parseInt(maxWinners)).toFixed(3)
      : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <ReviewItem label="Task Title" value={title} />
            <ReviewItem label="Description" value={description} multiline />

            {selectedTags.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Categories</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((key) => {
                    const tag = TAGS.find((t) => t.key === key);
                    return tag ? (
                      <span
                        key={key}
                        className="rounded-full px-2 py-0.5 text-[11px] font-medium border bg-brand/10 text-brand border-brand/20"
                      >
                        {tag.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <ReviewItem label="Reward" value={`${amount} ${selectedToken.symbol}`} highlight />
            {perWinner && (
              <ReviewItem label="Per Winner" value={`~${perWinner} ${selectedToken.symbol}`} />
            )}
            <ReviewItem label="Max Winners" value={maxWinners} />
            <ReviewItem label="Deadline" value={endDate} />
          </div>
        </div>

        {referenceUri && (
          <ReviewItem
            label="Reference"
            value={referenceUri}
            mono
            isLink
          />
        )}

        {thumbnailUri && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground shrink-0">Thumbnail</span>
            <img
              src={thumbnailUri}
              alt="Thumbnail"
              className="w-12 h-12 rounded-lg object-cover border border-border"
            />
          </div>
        )}

        <ReviewItem
          label="Moderator"
          value={moderator}
          mono
          copyable
          onCopy={() => copyToClipboard(moderator)}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Transaction Preview</h3>

        <div className="rounded-lg bg-muted border border-border p-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Action</span>
            <span className="text-foreground font-medium">Create bounty on Solana (devnet)</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-foreground font-medium">{amount} {selectedToken.symbol}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Destination</span>
            <span className="text-foreground font-medium">Escrow Vault (PDA)</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-xs">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="text-foreground">~0.000005 SOL</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Rent (refundable)</span>
            <span className="text-foreground">~0.002 SOL</span>
          </div>
        </div>

        <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 flex items-start gap-3">
          <Warning size={16} className="text-warning shrink-0 mt-0.5" weight="fill" />
          <div>
            <p className="text-xs font-medium text-warning mb-0.5">Irreversible Action</p>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. Funds will be locked in the non-custodial escrow smart contract and can only be released by the moderator or after the deadline expires.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({
  label,
  value,
  multiline,
  mono,
  highlight,
  copyable,
  onCopy,
  isLink,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  mono?: boolean;
  highlight?: boolean;
  copyable?: boolean;
  onCopy?: () => void;
  isLink?: boolean;
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground block mb-0.5">{label}</span>
      <div className="flex items-start gap-2">
        {multiline ? (
          <p className={`text-sm ${highlight ? "font-semibold text-foreground" : "text-foreground"} whitespace-pre-wrap break-words max-h-20 overflow-y-auto`}>
            {value}
          </p>
        ) : (
          <span
            className={`text-sm ${
              highlight
                ? "font-semibold text-foreground"
                : mono
                  ? "font-mono text-xs truncate max-w-[200px] sm:max-w-[300px] block"
                  : "text-foreground truncate block max-w-[200px] sm:max-w-[300px]"
            }`}
          >
            {isLink ? (
              <span className="inline-flex items-center gap-1 text-brand hover:underline">
                {value}
                <ArrowSquareOut size={12} />
              </span>
            ) : (
              value
            )}
          </span>
        )}
        {copyable && onCopy && (
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            aria-label="Copy to clipboard"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
