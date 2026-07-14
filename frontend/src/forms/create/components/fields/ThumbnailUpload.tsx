"use client";

import { useState, useRef, DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, X, Upload } from "lucide-react";
import { useGigCreateStore } from "@/stores/useGigCreateStore";
import { isValidImageFile } from "@/lib/validate";
import toast from "react-hot-toast";

export default function ThumbnailUpload() {
  const thumbnailUri = useGigCreateStore((s) => s.thumbnailUri);
  const setField = useGigCreateStore((s) => s.setField);
  const setUploading = useGigCreateStore((s) => s.setUploading);
  const uploading = useGigCreateStore((s) => s.isUploading);

  const [expanded, setExpanded] = useState(!!thumbnailUri);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const result = isValidImageFile(buffer, file.size);
    if (!result.valid) {
      toast.error(result.error || "Invalid image");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file, file.name);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setField("thumbnailUri", data.url);
    } catch {
      toast.error("Image upload failed. Try pasting a URL instead.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePasteUrl = (url: string) => {
    setField("thumbnailUri", url);
  };

  const remove = () => {
    setField("thumbnailUri", "");
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        aria-expanded={expanded}
      >
        <ImageIcon className="w-4 h-4" />
        {expanded ? "Remove thumbnail" : "Add thumbnail"}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-3">
              <input
                type="text"
                value={thumbnailUri}
                onChange={(e) => handlePasteUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand/50"
                placeholder="Paste image URL..."
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
                }}
                aria-label="Upload image from computer"
                className={`relative flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  dragOver
                    ? "border-brand bg-brand/5"
                    : "border-muted-foreground/30 hover:border-brand/50 hover:bg-muted/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                  }}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-muted-foreground">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-muted-foreground/60" />
                    <span className="text-xs text-muted-foreground mt-1">Upload from computer</span>
                  </>
                )}
              </div>

              {thumbnailUri && (
                <div className="relative inline-block">
                  <img
                    src={thumbnailUri}
                    alt="Thumbnail preview"
                    className="w-20 h-20 rounded-lg object-cover border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={remove}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/80 transition-colors"
                    aria-label="Remove thumbnail"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
