"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileSearchBar, ProfileFilters } from "@/components/profile-search-bar";
import { usePaginatedCollection } from "@/hooks/use-paginated-collection";
import { PhysicalizationProgressModal } from "@/components/physicalization-progress-modal";
import { CollectionItem } from "@/app/api/mock/data";

// Define the types for the data we'll fetch from the backend
type Order = {
  orderId: string; status: string; price: number; currency: string; timestamp: string;
  work: { id: string; slug: string; title: string; media: { type: 'image', url: string }[]; creator: { address: string; displayName: string }; };
};
type Physicalization = {
  physicalizationId: string; status: string; requestDate: string; shippingInfo: { carrier: string; trackingNumber: string; } | null;
  work: { id: string; slug: string; title: string; media: { type: 'image', url: string }[]; creator: { address: string; displayName: string }; };
};

// Fetcher functions for our new queries
const fetchOrders = async (address: string): Promise<Order[]> => {
  const res = await fetch(`/api/users/${address}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};
const fetchPhysicalizations = async (address: string): Promise<Physicalization[]> => {
  const res = await fetch(`/api/users/${address}/physicalizations`);
  if (!res.ok) throw new Error("Failed to fetch physicalizations");
  return res.json();
};

// Create a mock item that uses the new image
const mockItem: CollectionItem = {
  tokenId: "mock-token-id-12345",
  status: "MINTED",
  purchaseDate: new Date().toISOString(),
  work: {
    id: "mock-work-id-67890",
    slug: "0x47EBc52697aBe328618a2F2fD78413Bac7B413fD", // Using a real address for slug to allow clicking
    title: "MyLion",
    description: "佛山师。",
    media: [{ type: 'image', url: '/art/Weixin Image_2025-08-24_114608_082.jpg' }],
    creator: {
      address: "0x0000000000000000000000000000000000000000",
      displayName: "0xcE259d3d60923eb2EA77fb896d50bF00116531D4",
      avatarUrl: '/vercel.svg',
    },
  }
};

export function ProfileClientPage() {
  const { address, isConnected } = useAccount();

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProfileFilters>({ status: [] });
  const [page, setPage] = useState(1);
  const [selectedPhy, setSelectedPhy] = useState<Physicalization | null>(null);

  // Query for "My Collection" tab
  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError, isFetching } = usePaginatedCollection(query, filters, page);

  // Query for "Orders" tab
  const { data: orders = [], isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ['orders', { address }],
    queryFn: () => fetchOrders(address!),
    enabled: isConnected && !!address,
  });

  // Query for "Physicalizations" tab
  const { data: physicalizations = [], isLoading: isPhysicalizationsLoading, isError: isPhysicalizationsError } = useQuery({
    queryKey: ['physicalizations', { address }],
    queryFn: () => fetchPhysicalizations(address!),
    enabled: isConnected && !!address,
  });

  // Prepend the mock item to the fetched data for display
  const finalItems = collectionData?.items ? [mockItem, ...collectionData.items] : [mockItem];
  const finalTotal = (collectionData?.total ?? 0) + 1;

  const handleSearch = (params: { query: string; filters: ProfileFilters }) => {
    setPage(1);
    setQuery(params.query);
    setFilters(params.filters);
  };
  
  const handleViewProgress = (phy: Physicalization) => {
    setSelectedPhy(phy);
  };
  
  const totalPages = collectionData ? Math.ceil(finalTotal / collectionData.pageSize) : 0;

  return (
    <>
      <Tabs defaultValue="collection">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collection">My Collection</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="physicalizations">Physicalizations</TabsTrigger>
        </TabsList>

        <TabsContent value="collection">
          <div className="mt-6">
            <ProfileSearchBar onSearch={handleSearch} />
          </div>
          <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
            {isCollectionLoading && page === 1 ? <p>Loading collection...</p> : null}
            {isCollectionError ? <p>Error loading collection.</p> : null}
            {finalItems.map((item: CollectionItem) => (
              <Card key={item.tokenId}>
                <Link href={`/art/${item.work.slug}`} passHref>
                  <CardHeader>
                    <div className="aspect-[4/5] relative">
                      <Image
                        src={item.work.media[0].url}
                        alt={item.work.title}
                        fill
                        className="object-cover rounded-t-lg"
                        unoptimized
                      />
                    </div>
                  </CardHeader>
                </Link>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <CardTitle>{item.work.title}</CardTitle>
                    <Badge>{item.status}</Badge>
                  </div>
                  <CardDescription>by {item.work.creator.displayName}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    Purchased on: {new Date(item.purchaseDate).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          {collectionData && totalPages > 1 ? (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isFetching}>Next</Button>
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-4 mt-6">
            {isOrdersLoading && <p>Loading orders...</p>}
            {isOrdersError && <p>Error loading orders.</p>}
            {orders.map((order: Order) => (
              <Card key={order.orderId}>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{order.work.title}</CardTitle>
                    <CardDescription>Order ID: {order.orderId}</CardDescription>
                  </div>
                  <Badge>{order.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p>Price: {order.price} {order.currency}</p>
                  <p className="text-sm text-muted-foreground">
                    Ordered on: {new Date(order.timestamp).toLocaleString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/orders/${order.orderId}`} passHref>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="physicalizations">
          <div className="space-y-4 mt-6">
            {isPhysicalizationsLoading && <p>Loading physicalizations...</p>}
            {isPhysicalizationsError && <p>Error loading physicalizations.</p>}
            {physicalizations.map((phy: Physicalization) => (
              <Card key={phy.physicalizationId}>
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle>{phy.work.title}</CardTitle>
                    <CardDescription>Physicalization ID: {phy.physicalizationId}</CardDescription>
                  </div>
                  <Badge>{phy.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Requested on: {new Date(phy.requestDate).toLocaleDateString()}
                  </p>
                  {phy.shippingInfo && (
                    <div className="mt-2 text-sm">
                      <p>Carrier: {phy.shippingInfo.carrier}</p>
                      <p>Tracking: {phy.shippingInfo.trackingNumber}</p>
                    </div>
                  )}
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleViewProgress(phy)}>
                      View Progress
                    </Button>
                  </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <PhysicalizationProgressModal
          isOpen={!!selectedPhy}
          onOpenChange={(isOpen) => {
              if (!isOpen) setSelectedPhy(null);
          }}
          physicalizationId={selectedPhy?.physicalizationId || null}
          work={selectedPhy?.work || null}
      />
    </>
  );
}
