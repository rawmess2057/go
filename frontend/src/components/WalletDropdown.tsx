"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { Copy, User, SignOut } from "@phosphor-icons/react";
import toast from "react-hot-toast";

export default function WalletDropdown() {
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!wallet.publicKey) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="inline-flex items-center rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark active:scale-[0.98] transition-all shadow-lg shadow-brand/20"
      >
        Connect Wallet
      </button>
    );
  }

  const pk = wallet.publicKey.toBase58();
  const short = `${pk.slice(0, 4)}...${pk.slice(-4)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(pk);
    toast.success("Address copied");
    setOpen(false);
  };

  const viewProfile = () => {
    router.push(`/profile/${pk}`);
    setOpen(false);
  };

  const disconnect = () => {
    wallet.disconnect();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-mono">{short}</span>
        <svg
          className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-border bg-card shadow-lg shadow-black/5 z-20 py-1">
          <button
            onClick={copy}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          >
            <Copy size={16} />
            Copy Address
          </button>
          <button
            onClick={viewProfile}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          >
            <User size={16} />
            View Profile
          </button>
          <hr className="border-border mx-2" />
          <button
            onClick={disconnect}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-muted transition-colors"
          >
            <SignOut size={16} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
