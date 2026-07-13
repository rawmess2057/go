"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, SendTransactionError } from "@solana/web3.js";
import toast from "react-hot-toast";
import { useProgram } from "@/hooks/useProgram";
import { SOL_MINT, bountyAddress, vaultAddress, MIN_DEADLINE_SECONDS } from "@/lib/constants";
import { TAGS } from "@/lib/tags";
import { useTranslation } from "@/lib/i18n";
import { useNotifications } from "@/hooks/useNotifications";
import { isValidSubmissionUri } from "@/lib/validate";

const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

interface TokenOption {
  mint: PublicKey;
  symbol: string;
  decimals: number;
  balance?: number;
}

const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "So11111111111111111111111111111111111111112": { symbol: "SOL", decimals: 9 },
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr": { symbol: "USDC", decimals: 6 },
  "8zGu4iryBusWepoKNfN3LaYb1yGNYiJfS6WRa72Qiyo5": { symbol: "USDT", decimals: 6 },
  "mntE4Z5zXHo6DVs6o7WxGtpLGLeRgGCs5w5r8sGMwnF": { symbol: "mSOL", decimals: 9 },
};

const STEPS_KEYS = ["create.steps.0", "create.steps.1", "create.steps.2"];

export default function CreateBountyForm() {
  const { t } = useTranslation();
  const program = useProgram();
  const wallet = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceUri, setReferenceUri] = useState("");
  const [thumbnailUri, setThumbnailUri] = useState("");
  const [amount, setAmount] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("7");
  const [moderator, setModerator] = useState("");
  const [maxWinners, setMaxWinners] = useState("1");
  const [sending, setSending] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [tokenOptions, setTokenOptions] = useState<TokenOption[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenOption>({
    mint: SOL_MINT,
    symbol: "SOL",
    decimals: 9,
  });
  const [tokensLoading, setTokensLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // fetch user's SPL token accounts
  useEffect(() => {
    if (!wallet.publicKey) return;
    let cancelled = false;
    async function load() {
      setTokensLoading(true);
      try {
        const result = await connection.getTokenAccountsByOwner(wallet.publicKey!, {
          programId: TOKEN_PROGRAM_ID,
        });
        const tokens: TokenOption[] = [];
        for (const { account } of result.value) {
          const data = account.data;
          const mintHex = Buffer.from(data.slice(0, 32)).toString("hex");
          const mint = new PublicKey(mintHex);
          const mintStr = mint.toBase58();
          const known = KNOWN_TOKENS[mintStr];
          if (known) {
            tokens.push({
              mint,
              symbol: known.symbol,
              decimals: known.decimals,
            });
          }
        }
        if (!cancelled) {
          tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
          setTokenOptions(tokens);
        }
      } catch {
        // ignore — user may have no SPL tokens
      } finally {
        if (!cancelled) setTokensLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    if (!thumbnailUri) { setPreviewUrl(""); return; }
    setPreviewUrl(thumbnailUri);
  }, [thumbnailUri]);

  const steps = [t("create.steps.0"), t("create.steps.1"), t("create.steps.2")];

  function canAdvance(): boolean {
    if (step === 0) return title.trim().length > 0 && description.trim().length > 0;
    if (step === 1)
      return parseFloat(amount) > 0 && deadlineDays.length > 0 && moderator.length > 0;
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!program || !wallet.publicKey) {
      toast.error("Connect your wallet first");
      return;
    }
    if (uploading) {
      toast.error("Wait for the image upload to finish");
      return;
    }

    const isSol = selectedToken.mint.equals(SOL_MINT);
    const decimals = selectedToken.decimals;
    const multiplier = Math.pow(10, decimals);
    const rawAmount = Math.floor(parseFloat(amount) * multiplier);
    if (rawAmount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    let moderatorPubkey: PublicKey;
    try {
      moderatorPubkey = new PublicKey(moderator);
    } catch {
      toast.error("Invalid moderator public key");
      return;
    }

    const maxW = Math.min(Math.max(parseInt(maxWinners) || 1, 1), 10);
    if (maxW > 10) {
      toast.error("Max winners must be between 1 and 10");
      return;
    }

    const deadlineSecs = Math.floor(Date.now() / 1000) + parseInt(deadlineDays) * 86400;
    if (deadlineSecs < Math.floor(Date.now() / 1000) + MIN_DEADLINE_SECONDS) {
      toast.error("Deadline must be at least 1 hour in the future");
      return;
    }

    const trimmedRef = referenceUri.trim();
    if (trimmedRef && selectedTags.length === 0 && !isValidSubmissionUri(trimmedRef)) {
      toast.error("Invalid reference URI. Must be a valid https://, ipfs://, or ar:// link");
      return;
    }

    const id = new BN(Math.floor(Math.random() * 1_000_000) + 1);

    setSending(true);
    try {
      let finalReferenceUri = trimmedRef;
      if (selectedTags.length > 0) {
        const tagStr = `tags=${selectedTags.join(",")}`;
        finalReferenceUri = finalReferenceUri
          ? `${tagStr}||${finalReferenceUri}`
          : tagStr;
      }

      const [bountyPda] = bountyAddress(wallet.publicKey, id);
      const [vaultPda] = vaultAddress(bountyPda);

      // for SPL tokens, derive the user's ATA as the creator token account
      let creatorTokenAccount: PublicKey | null = null;
      if (!isSol) {
        const ATA_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
        [creatorTokenAccount] = PublicKey.findProgramAddressSync(
          [
            wallet.publicKey.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            selectedToken.mint.toBuffer(),
          ],
          ATA_PROGRAM,
        );
      }

      const tx = await program.methods
        .createBounty(
          new BN(id),
          moderatorPubkey,
          selectedToken.mint,
          new BN(rawAmount),
          new BN(deadlineSecs),
          title.trim(),
          description.trim(),
          finalReferenceUri,
          thumbnailUri.trim(),
          maxW
        )
        .accounts({
          creator: wallet.publicKey,
          bounty: bountyPda,
          vault: vaultPda,
          creatorTokenAccount: creatorTokenAccount,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        } as any)
        .rpc();

      await connection.confirmTransaction(tx, "confirmed");
      toast.success(t("create.toastSuccess"));
      addNotification({ type: "created", title: "Gig created", body: `"${title.trim() || "Untitled"}" is now live`, href: `/gig/${bountyPda.toBase58()}` });
      router.push(`/gig/${bountyPda.toBase58()}`);
    } catch (err: any) {
      if (err instanceof SendTransactionError) {
        console.error("Transaction simulation logs:", err.logs);
        toast.error("Transaction failed. Check your wallet for details.");
      } else {
        toast.error(err.message || t("create.toastError"));
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="rounded-xl bg-brand/5 border border-brand/20 p-4 mb-8 text-center">
        <p className="text-sm text-brand font-semibold">{t("create.brandHeader")}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{t("create.brandDesc")}</p>
      </div>
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i <= step ? "bg-brand text-white shadow-sm" : "bg-muted text-zinc-400"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm ${
                i <= step ? "text-zinc-900 font-medium" : "text-zinc-400"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${i < step ? "bg-brand" : "bg-zinc-200"}`} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.title")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              maxLength={50}
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              placeholder="What needs to be done?"
            />
            <p className="mt-1 text-xs text-zinc-400">{title.length}/50</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.description")} <span className="text-red-400">*</span>
            </label>
            <textarea
              maxLength={500}
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
              placeholder="Describe the task in detail..."
            />
            <p className="mt-1 text-xs text-zinc-400">{description.length}/500</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("create.fields.tags")} <span className="text-zinc-400">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const selected = selectedTags.includes(tag.key);
                return (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => {
                      setSelectedTags((prev) =>
                        selected
                          ? prev.filter((k) => k !== tag.key)
                          : prev.length < 3
                            ? [...prev, tag.key]
                            : prev
                      );
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-all ${
                      selected
                        ? "bg-brand text-white border-brand"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-brand/40"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">{t("create.fields.tagsHint")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.referenceUri")} <span className="text-zinc-400">(optional)</span>
            </label>
            <input
              type="text"
              value={referenceUri}
              onChange={(e) => setReferenceUri(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
              placeholder="ipfs://..., https://..."
            />
            <p className="mt-1 text-xs text-zinc-400">{t("create.fields.referenceHint")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.thumbnail")} <span className="text-zinc-400">(optional)</span>
            </label>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={thumbnailUri}
                  onChange={(e) => setThumbnailUri(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                  placeholder="Paste image URL..."
                />
                <label className="flex items-center gap-2 text-sm text-zinc-500 cursor-pointer hover:text-brand transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = "";
                      setUploading(true);
                      try {
                        const fd = new FormData();
                        fd.set("file", file, file.name);
                        const res = await fetch("/api/upload", { method: "POST", body: fd });
                        if (!res.ok) throw new Error("Upload failed");
                        const data = await res.json();
                        setThumbnailUri(data.url);
                      } catch (err) {
                        toast.error("Image upload failed. Try pasting a URL instead.");
                      } finally {
                        setUploading(false);
                      }
                    }}
                  />
                  <span className="w-5 h-5 rounded border border-dashed border-zinc-300 flex items-center justify-center text-xs">{uploading ? "..." : "+"}</span>
                  {uploading ? "Uploading..." : t("create.fields.thumbnailUpload")}
                </label>
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Thumbnail"
                  className="w-16 h-16 rounded-lg object-cover border border-border shrink-0"
                />
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400">{t("create.fields.thumbnailHint")}</p>
          </div>
          <button
            type="button"
            onClick={() => canAdvance() && setStep(1)}
            disabled={!canAdvance()}
            className="w-full rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t("create.next")}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-lg bg-brand/5 border border-brand/20 p-4 text-sm text-zinc-700">
            {t("create.infoBox")}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.reward")} <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step={Math.pow(10, -selectedToken.decimals).toString()}
                min={Math.pow(10, -selectedToken.decimals).toString()}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="1.0"
              />
              <select
                value={selectedToken.mint.toBase58()}
                onChange={(e) => {
                  const mintStr = e.target.value;
                  if (mintStr === SOL_MINT.toBase58()) {
                    setSelectedToken({ mint: SOL_MINT, symbol: "SOL", decimals: 9 });
                  } else {
                    const found = tokenOptions.find(
                      (t) => t.mint.toBase58() === mintStr
                    );
                    if (found) setSelectedToken(found);
                  }
                }}
                className="rounded-lg border border-border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 bg-white"
              >
                <option value={SOL_MINT.toBase58()}>SOL</option>
                {tokensLoading && (
                  <option disabled>Loading...</option>
                )}
                {tokenOptions.map((t) => (
                  <option key={t.mint.toBase58()} value={t.mint.toBase58()}>
                    {t.symbol}
                  </option>
                ))}
                {!tokensLoading && tokenOptions.length === 0 && (
                  <option value="" disabled>
                    No SPL tokens found
                  </option>
                )}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.maxWinners")} <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={maxWinners}
              onChange={(e) => setMaxWinners(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
            <p className="mt-1 text-xs text-zinc-400">{t("create.fields.maxWinnersHint")}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.deadline")} <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("create.fields.moderator")} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={moderator}
              onChange={(e) => setModerator(e.target.value)}
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
              placeholder={t("create.fields.moderatorPlaceholder")}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-muted transition-colors"
            >
              {t("create.back")}
            </button>
            <button
              type="button"
              onClick={() => canAdvance() && setStep(2)}
              disabled={!canAdvance()}
              className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t("create.next")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t("create.fields.title")}</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t("create.fields.description")}</span>
              <span className="font-medium max-w-[60%] text-right truncate">{description}</span>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("create.review.tags")}</span>
                <span className="flex gap-1.5">
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
                </span>
              </div>
            )}
            {referenceUri && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("create.review.reference")}</span>
                <span className="font-mono text-xs max-w-[50%] text-right truncate">{referenceUri}</span>
              </div>
            )}
            {thumbnailUri && (
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">{t("create.review.thumbnail")}</span>
                <span className="font-mono text-xs max-w-[50%] text-right truncate">{thumbnailUri}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t("create.review.reward")}</span>
              <span className="font-semibold text-brand">{amount} {selectedToken.symbol}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t("create.review.maxWinners")}</span>
              <span className="font-medium">{maxWinners}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t("create.review.deadline")}</span>
              <span className="font-medium">{deadlineDays} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">{t("create.review.moderator")}</span>
              <span className="font-mono text-xs max-w-[50%] text-right truncate">{moderator}</span>
            </div>
          </div>
          <div className="rounded-lg bg-brand/5 border border-brand/20 p-4 text-sm text-zinc-600">
            <p className="font-medium text-zinc-800 mb-1">{t("create.aboutTo")}</p>
            <ul className="list-disc list-inside space-y-1">
              {(t("create.aboutLines") as unknown as string[]).map((line: string) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-lg border border-border px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-muted transition-colors"
            >
              {t("create.back")}
            </button>
            <button
              type="submit"
              disabled={sending}
              className="flex-1 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? t("create.creating") : t("create.submit")}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
