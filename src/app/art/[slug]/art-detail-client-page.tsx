"use client";

import { useState, useEffect } from 'react';
import { Work, CollectionItem } from "@/app/api/mock/data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { PurchaseConfirmModal } from '@/components/purchase-confirm-modal';

const fetchMyCollection = async (): Promise<CollectionItem[]> => {
  const res = await fetch('/api/me/collections');
  if (!res.ok) {
    throw new Error('Failed to fetch collection');
  }
  const data = await res.json();
  return data.items;
};

type ArtDetailClientPageProps = {
  work: Work;
};

export function ArtDetailClientPage({ work }: ArtDetailClientPageProps) {
  const { data: myCollection, isLoading } = useQuery({
    queryKey: ['myCollection'],
    queryFn: fetchMyCollection,
  });

  const [ownedItem, setOwnedItem] = useState<CollectionItem | undefined>(undefined);
  const [stylesExpanded, setStylesExpanded] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedEdition, setSelectedEdition] = useState<Work['editions'][0] | null>(null);

  useEffect(() => {
    if (myCollection && work) {
      const item = myCollection.find(c => c.work.id === work.id);
      setOwnedItem(item);
    }
  }, [myCollection, work]);
  
  const handlePurchaseClick = (edition: Work['editions'][0]) => {
    setSelectedEdition(edition);
    setIsPurchaseModalOpen(true);
  };

  const renderActionButtons = (edition: Work['editions'][0]) => {
    if (edition.supply > 0) {
      return <Button onClick={() => handlePurchaseClick(edition)}>Purchase</Button>;
    }

    return <Button disabled>Sold Out</Button>;
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-[4/5] relative">
            <Image
              src={work.media[0].url}
              alt={work.title}
              fill
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight">{work.title}</h1>
          <div className="flex items-center mt-4">
            <Image
              src={work.creator.avatarUrl}
              alt={work.creator.displayName}
              width={40}
              height={40}
              className="rounded-full"
            />
            <p className="ml-3 text-lg font-medium">{work.creator.displayName}</p>
          </div>
          <p className="mt-6 text-lg text-muted-foreground">{work.description}</p>

          {work.type === 'blindbox' && work.blindboxStyles && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold">Styles & Probabilities</h2>
              <div className="mt-4 space-y-3">
                {(stylesExpanded ? work.blindboxStyles : work.blindboxStyles.slice(0, 2)).map((style, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 border rounded-md">
                    <Image src={style.mediaUrl} alt={style.name} width={64} height={64} className="rounded object-cover aspect-square" />
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold">{style.name}</p>
                        <Badge variant="secondary">{style.rarity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{style.probability}%</p>
                    </div>
                  </div>
                ))}
                {work.blindboxStyles.length > 2 && !stylesExpanded && (
                  <Button variant="link" onClick={() => setStylesExpanded(true)} className="p-0">
                    Show All {work.blindboxStyles.length} Styles
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex-grow">
            <h2 className="text-2xl font-bold">Editions</h2>
            <div className="mt-4 space-y-4">
              {work.editions.map((edition, index) => (
                <div key={index} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Price: {edition.price} {edition.currency}</p>
                    <p className="text-sm text-muted-foreground">Supply: {edition.supply}</p>
                  </div>
                  {renderActionButtons(edition)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {selectedEdition && (
        <PurchaseConfirmModal
          work={work}
          edition={selectedEdition}
          isOpen={isPurchaseModalOpen}
          onOpenChange={setIsPurchaseModalOpen}
        />
      )}
    </>
  );
}
