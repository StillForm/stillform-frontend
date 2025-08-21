"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InfoModal } from './info-modal';
import { Work } from '@/app/api/mock/data';

type UnlistModalProps = {
  work: Work;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlistComplete: (updatedWork: Work) => void;
};

export function UnlistModal({ work, isOpen, onOpenChange, onUnlistComplete }: UnlistModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; description: string } | null>(null);

  const handleUnlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/listings/${work.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unlist failed');
      }

      const result = await response.json();
      onUnlistComplete(result.updatedWork);

      setInfoModalContent({ title: 'Success', description: 'Your artwork has been unlisted successfully.' });
      onOpenChange(false);
    } catch (error) {
      console.error('Unlist failed', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. Please try again.';
      setInfoModalContent({ title: 'Unlisting Failed', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unlisting</DialogTitle>
            <DialogDescription>
              Are you sure you want to unlist "{work.title}"? It will no longer be visible to buyers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleUnlist} disabled={isLoading} variant="destructive">
              {isLoading ? 'Processing...' : 'Confirm Unlist'}
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
