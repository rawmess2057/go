"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { CaretDown } from "@phosphor-icons/react";
import { TokenOption, DEFAULT_TOKEN } from "@/forms/create/types";

interface TokenDropdownProps {
  selected: TokenOption;
  options: TokenOption[];
  loading: boolean;
  onChange: (token: TokenOption) => void;
}

export default function TokenDropdown({
  selected,
  options,
  loading,
  onChange,
}: TokenDropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const id = useId();

  const allOptions = [DEFAULT_TOKEN, ...options];
  const selectedLabel = selected.symbol;

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) setFocusedIdx(-1);
      return !prev;
    });
  }, []);

  const handleSelect = useCallback(
    (token: TokenOption) => {
      onChange(token);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.createElement("div");
    el.id = `token-dropdown-${id}`;
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.left = "0";
    el.style.zIndex = "9999";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    setPortalEl(el);
    return () => {
      document.body.removeChild(el);
    };
  }, [id]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIdx((prev) => (prev < allOptions.length - 1 ? prev + 1 : 0));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIdx((prev) => (prev > 0 ? prev - 1 : allOptions.length - 1));
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIdx >= 0 && focusedIdx < allOptions.length) {
          handleSelect(allOptions[focusedIdx]);
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, focusedIdx, allOptions, handleSelect]);

  useEffect(() => {
    if (open && focusedIdx >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIdx] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focusedIdx, open]);

  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open]);

  return (
    <div className="relative" style={{ pointerEvents: "auto" }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            if (!open) setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50 min-w-[100px] transition-all cursor-pointer"
      >
        <span className="flex-1 text-left">{selectedLabel}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        portalEl &&
        createPortal(
          <div
            ref={listRef}
            role="listbox"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              pointerEvents: "auto",
            }}
            className="rounded-xl border border-border bg-neutral-900 shadow-lg shadow-black/40 py-1 max-h-[260px] overflow-y-auto"
          >
            {allOptions.map((token, i) => {
              const isSelected =
                token.mint.toBase58() === selected.mint.toBase58();
              return (
                <button
                  key={token.mint.toBase58()}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setFocusedIdx(i)}
                  onClick={() => handleSelect(token)}
                  className={`w-full px-3 py-2.5 text-sm text-left transition-colors ${
                    isSelected
                      ? "text-brand font-medium"
                      : focusedIdx === i
                        ? "text-foreground bg-white/10"
                        : "text-foreground"
                  }`}
                >
                  {token.symbol}
                </button>
              );
            })}
            {!loading && allOptions.length === 0 && (
              <div className="px-3 py-2.5 text-sm text-muted-foreground">
                No tokens available
              </div>
            )}
          </div>,
          portalEl
        )}
    </div>
  );
}
