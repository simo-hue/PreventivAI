"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function LogoutButton({ 
  className, 
  variant = "ghost" 
}: { 
  className?: string;
  variant?: "ghost" | "primary" | "secondary" | "danger";
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    setIsPending(true);
    try {
      const res = await fetch("/auth/signout", { method: "POST" });
      if (res.redirected) {
        window.location.href = res.url;
      } else if (res.ok) {
        window.location.href = "/login";
      }
    } catch (e) {
      console.error(e);
      window.location.href = "/login";
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Button 
        type="button" 
        variant={variant} 
        className={className || (variant === "ghost" ? "text-slate-500 hover:text-slate-900" : "")}
        onClick={() => setIsConfirmOpen(true)}
      >
        <LogOut className="mr-2 h-4 w-4" />
        <span className="hidden sm:inline">Esci</span>
      </Button>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isPending={isPending}
        title="Esci dall'account"
        description="Sei sicuro di voler uscire? Dovrai effettuare nuovamente l'accesso per visualizzare i tuoi progetti e preventivi."
        confirmText="Sì, esci"
        cancelText="Annulla"
        variant="warning"
      />
    </>
  );
}
