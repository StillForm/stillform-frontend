"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Work } from '@/app/api/mock/data';
import { InfoModal } from './info-modal';
import Image from 'next/image';

type PurchaseConfirmModalProps = {
  work: Work;
  edition: Work['editions'][0];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PurchaseConfirmModal({ work, edition, isOpen, onOpenChange }: PurchaseConfirmModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; description: string } | null>(null);

  const totalPrice = (quantity * edition.price).toFixed(4);

  const handlePurchase = async () => {
    if (!termsAccepted) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId: work.id,
          editionId: edition.editionId,
          quantity: quantity,
          buyerAddress: '0xdef...456', // Mock address for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Purchase failed');
      }

      const result = await response.json();
      console.log('Purchase successful:', result);
      setInfoModalContent({ title: 'Success', description: 'Your purchase was completed successfully.' });
      onOpenChange(false);
    } catch (error) {
      console.error('Purchase failed', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. Please try again.';
      setInfoModalContent({ title: 'Purchase Failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Image src={work.media[0].url} alt={work.title} width={80} height={100} className="rounded object-cover" />
              <div>
                <h3 className="font-bold">{work.title}</h3>
                <p className="text-sm text-muted-foreground">by {work.creator.displayName}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="col-span-3"
                max={edition.supply}
              />
            </div>
             <div className="text-right font-bold text-lg">
              Total: {totalPrice} {edition.currency}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the terms and conditions.
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handlePurchase} disabled={!termsAccepted || isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {infoModalContent && (
        <InfoModal
          isOpen={!!infoModalContent}
          onOpenChange={() => setInfoModalContent(null)}
          title={infoModalContent.title}
          description={infoModalContent.description}
        />
      )}
    </>
  );
}
