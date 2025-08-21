"use client";

import { useState } from "react";
import { CollectionItem, Order, Physicalization } from "@/app/api/mock/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileSearchBar, ProfileFilters } from "@/components/profile-search-bar";
import { usePaginatedCollection } from "@/hooks/use-paginated-collection";
import { PhysicalizationProgressModal } from "@/components/physicalization-progress-modal";

type ProfileClientPageProps = {
  initialOrders: Order[];
  initialPhysicalizations: Physicalization[];
};

export function ProfileClientPage({ initialOrders, initialPhysicalizations }: ProfileClientPageProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProfileFilters>({ status: [] });
  const [page, setPage] = useState(1);
  const [selectedPhy, setSelectedPhy] = useState<Physicalization | null>(null);

  const { data, isLoading, isError, isFetching } = usePaginatedCollection(query, filters, page);

  const handleSearch = (params: { query: string; filters: ProfileFilters }) => {
    setPage(1);
    setQuery(params.query);
    setFilters(params.filters);
  };

  const handleViewProgress = (phy: Physicalization) => {
    setSelectedPhy(phy);
  };
  
  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

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
          {isLoading ? <p>Loading collection...</p> : null}
          {isError ? <p>Error loading collection.</p> : null}
          {data?.items.map((item: CollectionItem) => (
            <Card key={item.tokenId}>
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
              <CardFooter>
                <Link href={`/profile/${item.work.slug}`} passHref>
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        {data && totalPages > 1 ? (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isFetching}>Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || isFetching}>Next</Button>
          </div>
        ) : null}
      </TabsContent>

      <TabsContent value="orders">
        <div className="space-y-4 mt-6">
          {initialOrders.map((order: Order) => (
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
          {initialPhysicalizations.map((phy: Physicalization) => (
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
