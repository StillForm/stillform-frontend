"use client";

import { useParams } from 'next/navigation';
import { useArtProductCollection, usePrimaryMarket, artProductCollectionAbi } from '@/lib/contractClient';
import { Address } from 'viem';
import { useMemo } from 'react';
import { useReadContracts } from 'wagmi';
import { useQuery } from '@tanstack/react-query';

// Components
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";



// Re-created components locally to fix module resolution issue
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

type CollectionConfig = {
  ptype: number;
  price: bigint;
  maxSupply: bigint;
  unrevealedUri: string;
  creator: Address;
  registry: Address;
};

// As returned by the contract call, it's a tuple (array)
type StyleTuple = readonly [number, number, number, string]; // [weightBp, maxSupply, minted, baseUri]

export function ArtDetailClientPage() {
  const params = useParams();
  const slug = params.slug as Address;

  const { data: contractResults, isLoading: isConfigLoading, isError: isConfigError } = useReadContracts({
    contracts: [
      { address: slug, abi: artProductCollectionAbi, functionName: 'config' },
      { address: slug, abi: artProductCollectionAbi, functionName: 'name' },
      { address: slug, abi: artProductCollectionAbi, functionName: 'styles', args: [0] },
    ],
  });

  const { config, name, style } = useMemo(() => {
    if (!contractResults || contractResults.length < 3) return { config: null, name: null, style: null };
    return {
      config: contractResults[0].status === 'success' ? contractResults[0].result as CollectionConfig : null,
      name: contractResults[1].status === 'success' ? contractResults[1].result as string : null,
      style: contractResults[2].status === 'success' ? contractResults[2].result as StyleTuple : null,
    };
  }, [contractResults]);

  const { purchase, isPending, isConfirming, error, hash } = usePrimaryMarket();

  const handlePurchase = () => {
    if (slug && config?.price) {
      purchase(slug, config.price);
    } else {
      console.error("Purchase failed: Invalid address or price.");
    }
  };

  const isLoading = isConfigLoading;
  const isError = isConfigError;

  if (isLoading) {
    return <div className="container py-10"><p>Loading on-chain data...</p></div>;
  }

  if (isError || !config || !name || !style) {
    return <div className="container py-10"><p>Error fetching data. Please ensure the address is correct and you are on the right network.</p></div>;
  }

  const creatorAddress = config?.creator || "0x0000000000000000000000000000000000000000";
  const [weightBp, maxSupply, minted, baseUri] = style;
  const imageUrl = baseUri || '/vercel.svg';

  const work = {
    title: name || `On-Chain Collection: ${slug.slice(0, 8)}...`,
    description: "Description must be fetched from metadata URI.", // This part needs a separate metadata fetch if required
    imageUrl: imageUrl,
    id: slug,
    slug: slug,
    price: config?.price ? Number(config.price) / 1e18 : 0,
    chain: 'eth',
    creator: {
      name: creatorAddress,
      avatarUrl: '/vercel.svg',
      displayName: `Creator: ${creatorAddress.slice(0, 6)}...`
    },
    media: [{ type: 'image', url: imageUrl }],
    type: config?.ptype === 0 ? 'normal' : 'blindbox',
    physical: [],
    editions: [{
      price: config?.price ? Number(config.price) / 1e18 : 0,
      currency: 'ETH',
      supply: config?.maxSupply ? Number(config.maxSupply) : 0,
    }],
  };
  
    const purchaseButtonText = isConfirming 
    ? "Confirming..." 
    : isPending 
    ? "Check Wallet..." 
    : work.editions[0].supply > Number(minted)
    ? "Purchase" 
    : "Sold Out";

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
              priority
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold tracking-tight">{work.title}</h1>
          <CreatorInfo creator={work.creator} />
          <p className="mt-6 text-lg text-muted-foreground">{work.description}</p>

          <div className="mt-8 flex-grow">
            <h2 className="text-2xl font-bold">Edition</h2>
            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <PriceInfo price={work.price} />
                  <EditionInfo minted={Number(minted)} total={work.editions[0].supply} />
                </div>
                <Button onClick={handlePurchase} disabled={work.editions[0].supply <= Number(minted) || isPending || isConfirming}>
                  {purchaseButtonText}
                </Button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500">Error: {error.shortMessage || error.message}</p>
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
