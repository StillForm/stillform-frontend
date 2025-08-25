"use client";

import { Address } from 'viem';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePrimaryMarket } from '@/lib/contractClient';
import { Work } from '@/app/api/mock/data'; // Using the established Work type

// --- Re-usable sub-components for display ---
const CreatorInfo = ({ creator }: { creator: { displayName: string } }) => (
  <p className="mt-2 text-sm text-muted-foreground">
    Created by <span className="font-semibold">{creator.displayName}</span>
  </p>
);

const PriceInfo = ({ price }: { price: number }) => (
  <p className="text-xl font-bold">{price} ETH</p>
);

const EditionInfo = ({ minted, total }: { minted: number; total: number }) => (
  <p className="text-sm text-muted-foreground">{minted} / {total} sold</p>
);
// --- End of sub-components ---


interface ArtDetailClientPageProps {
  work: Work;
}

/**
 * A client component responsible for rendering the art details and handling user interactions like purchasing.
 * It receives all necessary data as props from its parent server component.
 */
export function ArtDetailClientPage({ work }: ArtDetailClientPageProps) {
  // This hook is for client-side interactions (i.e., sending a transaction)
  const { purchase, isPending, isConfirming, error, hash } = usePrimaryMarket();

  const handlePurchase = () => {
    const priceInWei = BigInt(work.editions[0].price * 1e18);
    purchase(work.chain.contractAddress, priceInWei);
  };
  
  const purchaseButtonText = isConfirming 
    ? "Confirming..." 
    : isPending 
    ? "Check Wallet..." 
    : work.editions[0].supply > work.stats.sales
    ? "Purchase" 
    : "Sold Out";

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Column */}
        <div>
          <div className="aspect-[4/5] relative">
            <Image
              src={work.media[0].url}
              alt={work.title}
              fill
              className="object-cover w-full h-full rounded-lg"
              priority
              unoptimized // Keep this to handle large images
            />
          </div>
        </div>

        {/* Details Column */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight">{work.title}</h1>
          <CreatorInfo creator={work.creator} />
          <p className="mt-6 text-lg text-muted-foreground">{work.description}</p>

          <div className="mt-8 flex-grow">
            <h2 className="text-2xl font-bold">Edition</h2>
            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <PriceInfo price={work.editions[0].price} />
                  <EditionInfo minted={work.stats.sales} total={work.editions[0].supply} />
                </div>
                <Button onClick={handlePurchase} disabled={work.editions[0].supply <= work.stats.sales || isPending || isConfirming}>
                  {purchaseButtonText}
                </Button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">Error: {error.message.split('(')[0]}</p>
              )}
              {hash && (
                <p className="mt-2 text-sm text-green-500">
                    Transaction sent! <a href={`https://sepolia.etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline">View on Etherscan</a>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
