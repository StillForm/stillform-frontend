"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Work } from "@/app/api/mock/data";

interface SellModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  work: Work | null;
  onSuccess: () => void;
}

export function SellModal({ isOpen, onOpenChange, work, onSuccess }: SellModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSell = async () => {
    if (!work) return;
    setIsLoading(true);
    try {
      // Mock API call
      console.log(`Selling ${work.title}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would PATCH the work status or create a sale record
      // For now, we just show a success message.
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to sell:", error);
      // Here you would show an error message in an InfoModal
    } finally {
      setIsLoading(false);
    }
  };

  if (!work) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Sale</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to sell your edition of{" "}
            <span className="font-semibold">{work.title}</span>? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSell} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
