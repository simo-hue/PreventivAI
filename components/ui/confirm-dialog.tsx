"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2, CheckCircle2, Info } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/src/lib/utils/cn";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: "danger" | "warning" | "info" | "success";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Conferma",
  cancelText = "Annulla",
  isPending = false,
  variant = "danger",
}: ConfirmDialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isPending]);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isPending) {
      onClose();
    }
  };

  const variantColors = {
    danger: {
      iconBg: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 ring-4 ring-red-50 dark:ring-red-950/10",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500",
    },
    warning: {
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 ring-4 ring-amber-50 dark:ring-amber-950/10",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white border-transparent focus:ring-amber-500",
    },
    info: {
      iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 ring-4 ring-blue-50 dark:ring-blue-950/10",
      confirmBtn: "bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white border-transparent focus:ring-zinc-500",
      icon: Info,
    },
    success: {
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-950/10",
      confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent focus:ring-emerald-500",
      icon: CheckCircle2,
    },
  };

  const colors = variantColors[variant] as any;
  const Icon = colors.icon || AlertTriangle;

  const dialogContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl transition-all duration-300 scale-100 animate-in zoom-in-95"
      >
        {/* Icon & Accent */}
        <div className="flex flex-col items-center text-center">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110", colors.iconBg)}>
            <Icon className="h-6 w-6" aria-hidden="true" />
          </div>

          {/* Typography */}
          <h2
            id="confirm-dialog-title"
            className="mt-4 text-lg font-bold tracking-tight text-[var(--foreground)]"
          >
            {title}
          </h2>
          <p
            id="confirm-dialog-description"
            className="mt-2 text-sm leading-relaxed text-[var(--muted)]"
          >
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            className="w-full text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 border-zinc-200"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "w-full font-semibold shadow-sm inline-flex items-center justify-center gap-2",
              colors.confirmBtn
            )}
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
