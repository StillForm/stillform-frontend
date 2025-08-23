"use client";

"use client";

import { useParams } from 'next/navigation';
import { Address } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount } from 'wagmi';

// Components
import { Button } from "@/components/ui/button";
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

const fetchCollection = async (id: string) => {
  const response = await fetch(`http://localhost:3001/api/collections/${id}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export function ArtDetailClientPage({ isCreatorView = false }: { isCreatorView?: boolean }) {
  const params = useParams();
  const slug = params.slug as string;

  const { data: collection, isLoading, isError, refetch } = useQuery({
    queryKey: ['collection', slug],
    queryFn: () => fetchCollection(slug),
    enabled: !!slug,
  });

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<any | null>(null);
  const { address: buyerAddress } = useAccount();

  const handlePurchase = async () => {
    if (!buyerAddress) {
      setPurchaseError("Please connect your wallet to purchase.");
      return;
    }
    if (!slug) {
      setPurchaseError("Collection ID is missing.");
      return;
    }

    setIsPurchasing(true);
    setPurchaseError(null);
    setPurchaseSuccess(null);

    try {
      // 1. Create Order
      const orderResponse = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerAddress, collectionId: slug }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.message || 'Failed to create order.');

      // 2. Pay for Order
      const payResponse = await fetch(`http://localhost:3001/api/orders/${order.id}/pay`, {
        method: 'PATCH',
      });
      const paidOrder = await payResponse.json();
      if (!payResponse.ok) throw new Error(paidOrder.message || 'Failed to process payment.');

      // 3. Open blind box if applicable
      if (collection.type === 'BLIND_BOX') {
        const openResponse = await fetch(`http://localhost:3001/api/blindbox/open/${paidOrder.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: buyerAddress }),
        });
        const nft = await openResponse.json();
        if (!openResponse.ok) throw new Error(nft.message || 'Failed to open blind box.');
        setPurchaseSuccess({ type: 'blindbox', data: nft });
      } else {
        const completeResponse = await fetch(`http://localhost:3001/api/orders/${order.id}/complete`, {
            method: 'PATCH',
        });
        const completedOrder = await completeResponse.json();
        if (!completeResponse.ok) throw new Error(completedOrder.message || 'Failed to complete order.');
        setPurchaseSuccess({ type: 'normal', data: completedOrder });
      }
      
      // Refetch collection data to update sold count
      refetch();

    } catch (err: any) {
      setPurchaseError(err.message);
    } finally {
      setIsPurchasing(false);
    }
  };


  if (isLoading) {
    return <div className="container py-10"><p>Loading collection data...</p></div>;
  }

  if (isError || !collection) {
    return <div className="container py-10"><p>Error fetching data. Please try again later.</p></div>;
  }
  
  const creatorAddress = collection.creatorAddress || "0x0000000000000000000000000000000000000000";
  // NOTE: Image URL is missing from the API response, so we use a placeholder.
  // This needs to be addressed in the backend or by fetching metadata.
  const imageUrl = collection.coverImageUrl || '/vercel.svg'; 
  
  const work = {
    title: collection.name || `Collection: ${collection.id.slice(0, 8)}...`,
    description: "Description from API.",
    imageUrl: imageUrl,
    id: collection.id,
    slug: collection.id,
    price: collection.price ? parseFloat(collection.price) / 1e18 : 0, // Assuming price is in wei as a string
    chain: 'eth',
    creator: {
      name: creatorAddress,
      avatarUrl: '/vercel.svg',
      displayName: `Creator: ${creatorAddress.slice(0, 6)}...`
    },
    media: [{ type: 'image', url: imageUrl }],
    type: collection.type === 'NORMAL' ? 'normal' : 'blindbox',
    physical: [],
    editions: [{
      price: collection.price ? parseFloat(collection.price) / 1e18 : 0,
      currency: 'ETH',
      supply: collection.maxSupply || 0,
    }],
  };
  
  const totalMinted = collection.nfts?.length || 0;
  
  const purchaseButtonText = isPurchasing
    ? "Processing..."
    : purchaseSuccess
    ? "Purchased!"
    : work.editions[0].supply > totalMinted
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
          
          {work.type === 'blindbox' && collection.blindBox?.options && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold">Available Styles (from Blind Box)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {Object.entries(collection.blindBox.options).map(([styleName, probability], index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {/* Placeholder for style image */}
                    <div className="aspect-square relative bg-gray-200 rounded-md">
                       <Image
                        src={'/vercel.svg'} // Placeholder image
                        alt={`Style ${styleName}`}
                        fill
                        className="object-cover w-full h-full rounded-md"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-semibold">{styleName}</p>
                      <p className="text-sm text-muted-foreground">Probability: {probability as number}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex-grow">
            {isCreatorView ? (
              <div className="p-4 border rounded-lg bg-secondary">
                <h2 className="text-xl font-bold">Creator Actions</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your collection.
                </p>
                <div className="flex gap-4">
                  <Button>Edit Details</Button>
                  <Button variant="outline">Manage Editions</Button>
                  <Button variant="destructive">Delist Collection</Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold">Purchase Edition</h2>
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <PriceInfo price={work.price} />
                      <EditionInfo minted={totalMinted} total={work.editions[0].supply} />
                    </div>
                    <Button onClick={handlePurchase} disabled={isPurchasing || !!purchaseSuccess || work.editions[0].supply <= totalMinted}>
                      {purchaseButtonText}
                    </Button>
                  </div>
                  {purchaseError && (
                    <p className="mt-2 text-sm text-red-500">Error: {purchaseError}</p>
                  )}
                  {purchaseSuccess && (
                    <div className="mt-2 text-sm text-green-500">
                      <p>Purchase Successful!</p>
                      {/* ... success message rendering ... */}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
