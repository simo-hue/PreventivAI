"use client";

import { useState, useRef } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function LogoutButton({ 
  className, 
  variant = "ghost" 
}: { 
  className?: string;
  variant?: "ghost" | "default" | "secondary" | "outline" | "danger";
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleConfirm = () => {
    formRef.current?.submit();
  };

  return (
    <>
      <form ref={formRef} action="/auth/signout" method="post" className={className}>
        <Button 
          type="button" 
          variant={variant} 
          className={variant === "ghost" ? "text-slate-500 hover:text-slate-900" : ""}
          onClick={() => setIsConfirmOpen(true)}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Esci</span>
        </Button>
      </form>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Esci dall'account"
        description="Sei sicuro di voler uscire? Dovrai effettuare nuovamente l'accesso per visualizzare i tuoi progetti e preventivi."
        confirmText="Sì, esci"
        cancelText="Annulla"
        variant="warning"
      />
    </>
  );
}
