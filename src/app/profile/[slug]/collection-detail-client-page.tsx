"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Work, CollectionItem, TransactionEvent } from "@/app/api/mock/data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ListForSaleModal } from "@/components/list-for-sale-modal";
import { UnlistModal } from "@/components/unlist-modal";
import { PhysicalizeModal } from "@/components/physicalize-modal";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/order-timeline";

type CollectionDetailClientPageProps = {
  data: {
    work: Work;
    item: CollectionItem;
  }
};

export function CollectionDetailClientPage({ data }: CollectionDetailClientPageProps) {
  const router = useRouter();
  const { work, item } = data;
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isUnlistModalOpen, setIsUnlistModalOpen] = useState(false);
  const [isPhysicalizeModalOpen, setIsPhysicalizeModalOpen] = useState(false);

  const isListed = item.status === 'Listed';
  const isOwned = item.status === 'Owned';
  const isLocked = item.physicalStatus === 'Locked';

  const isListDisabled = !isOwned || isLocked;
  const isUnlistDisabled = !isListed || isLocked;
  const isExtractDisabled = !isOwned || isLocked;

  const handleMutationComplete = () => {
    router.refresh();
  };

  const transactionHistory: TransactionEvent[] = [
    { event: 'Minted', timestamp: work.mintDate, user: work.creator.displayName },
    { event: 'Purchased', timestamp: item.purchaseDate, user: 'You' },
    ...(item.history || []),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-[4/5] relative bg-muted rounded-lg">
          {work.media && work.media.length > 0 ? (
            <Image
              src={work.media[0].url}
              alt={work.title}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No Image</p>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
               <Badge>{item.status}</Badge>
               {item.physicalStatus !== 'NotRequested' && <Badge variant="secondary">{item.physicalStatus}</Badge>}
            </div>
            <h1 className="text-4xl font-bold tracking-tighter">{work.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">by {work.creator.displayName}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Description</h2>
            <p className="mt-2 text-muted-foreground">{work.description}</p>
          </div>
          <div className="pt-6 space-y-4">
            <Button className="w-full" size="lg" onClick={() => setIsListModalOpen(true)} disabled={isListDisabled}>
              List for Sale
            </Button>
            <Button className="w-full" size="lg" onClick={() => setIsUnlistModalOpen(true)} disabled={isUnlistDisabled}>
              Unlist
            </Button>
            <Button className="w-full" size="lg" variant="outline" onClick={() => setIsPhysicalizeModalOpen(true)} disabled={isExtractDisabled}>
              Extract
            </Button>
            {isLocked && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                This item is locked and cannot be traded or modified.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">Transaction History</h2>
        <OrderTimeline history={transactionHistory} />
      </div>

      <ListForSaleModal
        work={work}
        isOpen={isListModalOpen}
        onOpenChange={setIsListModalOpen}
        onListingComplete={handleMutationComplete}
      />
      <UnlistModal
        work={work}
        isOpen={isUnlistModalOpen}
        onOpenChange={setIsUnlistModalOpen}
        onUnlistComplete={handleMutationComplete}
      />
      <PhysicalizeModal
        work={work}
        isOpen={isPhysicalizeModalOpen}
        onOpenChange={setIsPhysicalizeModalOpen}
        onPhysicalizeComplete={handleMutationComplete}
      />
    </>
  );
}
