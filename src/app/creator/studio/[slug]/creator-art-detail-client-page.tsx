"use client";

import { useState } from 'react';
import { Work } from "@/app/api/mock/data";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { ListForSaleModal } from '@/components/list-for-sale-modal';
import { UnlistModal } from '@/components/unlist-modal';

type CreatorArtDetailClientPageProps = {
  work: Work;
};

export function CreatorArtDetailClientPage({ work: initialWork }: CreatorArtDetailClientPageProps) {
  const [work, setWork] = useState(initialWork);
  const [stylesExpanded, setStylesExpanded] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isUnlistModalOpen, setIsUnlistModalOpen] = useState(false);

  // In a real app, this would be determined by checking if the work has any associated sales records.
  const hasBeenSold = work.stats.sales > 0;

  const handleListingComplete = (updatedWork: Work) => {
    setWork(updatedWork);
  };

  const renderActionButtons = () => {
    switch (work.status) {
      case 'draft':
      case 'unlisted':
        return (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/creator/new">Edit</Link>
            </Button>
            <Button onClick={() => setIsListModalOpen(true)}>
              List for Sale
            </Button>
          </div>
        );
      case 'listed':
        return (
          <div className="flex gap-2">
            <Button asChild variant="outline" disabled={hasBeenSold}>
              <Link href="/creator/new">Edit</Link>
            </Button>
            <Button onClick={() => setIsUnlistModalOpen(true)} variant="destructive">
              Unlist
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  const getStatusVariant = (status: Work['status']) => {
    switch (status) {
      case 'listed':
        return 'success';
      case 'unlisted':
        return 'secondary';
      case 'draft':
      default:
        return 'outline';
    }
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
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold tracking-tight">{work.title}</h1>
            <Badge variant={getStatusVariant(work.status)} className="capitalize text-lg">
              {work.status}
            </Badge>
          </div>
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
             <div className="p-4 border rounded-lg flex justify-between items-center">
               <div>
                 <p className="font-semibold">Manage Artwork</p>
                 <p className="text-sm text-muted-foreground">
                    {hasBeenSold ? "This work has sales and can no longer be edited." : "You can edit, list, or unlist this work."}
                 </p>
               </div>
               {renderActionButtons()}
             </div>
          </div>
        </div>
      </div>
      <ListForSaleModal
        work={work}
        edition={work.editions[0]} // Assuming one edition for now
        isOpen={isListModalOpen}
        onOpenChange={setIsListModalOpen}
        onListingComplete={handleListingComplete}
      />
      <UnlistModal
        work={work}
        isOpen={isUnlistModalOpen}
        onOpenChange={setIsUnlistModalOpen}
        onUnlistComplete={handleListingComplete}
      />
    </>
  );
}
