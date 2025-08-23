"use client";

import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Order, Physicalization, CollectionItem } from "@/app/api/mock/data"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileSearchBar, ProfileFilters } from "@/components/profile-search-bar";
import { usePaginatedCollection } from "@/hooks/use-paginated-collection";
import { PhysicalizationProgressModal } from "@/components/physicalization-progress-modal";
import { useAccount } from "wagmi";

const fetchUserOrders = async (address: string | undefined): Promise<Order[]> => {
  if (!address) return [];
  const res = await fetch(`http://localhost:3001/api/users/${address}/orders`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

const fetchUserPhysicalizations = async (address: string | undefined): Promise<Physicalization[]> => {
  if (!address) return [];
  const res = await fetch(`http://localhost:3001/api/users/${address}/physicalizations`);
  if (!res.ok) throw new Error("Failed to fetch physicalizations");
  return res.json();
}

export function ProfileClientPage() {
  const { address } = useAccount();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProfileFilters>({ status: [] });
  const [page, setPage] = useState(1);
  const [selectedPhy, setSelectedPhy] = useState<Physicalization | null>(null);

  const { data: collectionData, isLoading: isCollectionLoading, isError: isCollectionError } = usePaginatedCollection(query, filters, page);
  const { data: ordersData, isLoading: isOrdersLoading, isError: isOrdersError } = useQuery({
    queryKey: ['userOrders', address],
    queryFn: () => fetchUserOrders(address),
    enabled: !!address,
  });
   const { data: physicalizationsData, isLoading: isPhyLoading, isError: isPhyError } = useQuery({
    queryKey: ['userPhysicalizations', address],
    queryFn: () => fetchUserPhysicalizations(address),
    enabled: !!address,
  });


  const handleSearch = (params: { query: string; filters: ProfileFilters }) => {
    setPage(1);
    setQuery(params.query);
    setFilters(params.filters);
  };

  const handleViewProgress = (phy: Physicalization) => {
    setSelectedPhy(phy);
  };
  
  const totalPages = collectionData ? Math.ceil(collectionData.total / collectionData.pageSize) : 0;

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
          {isCollectionLoading && <p>Loading collection...</p>}
          {isCollectionError && <p>Error loading collection.</p>}
          {collectionData?.items.map((item: any) => ( // Using any temporarily as the shape from backend might differ
            <Card key={item.tokenId}>
              <Link href={`/profile/${item.work.slug}`} passHref>
                <CardHeader>
                  <div className="aspect-[4/5] relative">
                    <Image
                      src={item.work.media[0].url}
                      alt={item.work.title}
                      fill
                      className="object-cover rounded-t-lg"
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
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        ) : null}
      </TabsContent>

      <TabsContent value="orders">
        <div className="space-y-4 mt-6">
            {isOrdersLoading && <p>Loading orders...</p>}
            {isOrdersError && <p>Failed to load orders.</p>}
            {ordersData?.map((order: Order) => (
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
            {isPhyLoading && <p>Loading physicalizations...</p>}
            {isPhyError && <p>Failed to load physicalizations.</p>}
            {physicalizationsData?.map((phy: Physicalization) => (
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
