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

type ListForSaleModalProps = {
  work: Work;
  edition: Work['editions'][0];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onListingComplete: (updatedWork: Work) => void;
};

export function ListForSaleModal({ work, edition, isOpen, onOpenChange, onListingComplete }: ListForSaleModalProps) {
  const [price, setPrice] = useState(edition.price);
  const [currency, setCurrency] = useState(edition.currency);
  const [supply, setSupply] = useState(edition.supply);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; description: string } | null>(null);

  const handleList = async () => {
    if (!termsAccepted) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workId: work.id,
          editionId: edition.editionId,
          price,
          currency,
          supply, // Note: The current API doesn't use this, but we send it.
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Listing failed');
      }

      const result = await response.json();
      onListingComplete(result.updatedWork);
      
      setInfoModalContent({ title: 'Success', description: 'Your artwork has been listed successfully.' });
      onOpenChange(false);
    } catch (error) {
      console.error('Listing failed', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. Please try again.';
      setInfoModalContent({ title: 'Listing Failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>List for Sale</DialogTitle>
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
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currency" className="text-right">
                Currency
              </Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supply" className="text-right">
                Supply
              </Label>
              <Input
                id="supply"
                type="number"
                value={supply}
                onChange={(e) => setSupply(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(!!checked)} />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the listing terms and conditions.
              </label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleList} disabled={!termsAccepted || isLoading}>
              {isLoading ? 'Processing...' : 'Confirm Listing'}
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
