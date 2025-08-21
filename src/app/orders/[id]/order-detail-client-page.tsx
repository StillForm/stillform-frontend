"use client";

import { useState } from "react";
import { Order, Physicalization, Work } from "@/app/api/mock/data";
import { useQuery } from "@tanstack/react-query";
import { OrderTimeline, TimelineStatus } from "@/components/order-timeline";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type OrderDetailData = {
  order: Order;
  physicalization?: Physicalization;
};

type OrderDetailClientPageProps = {
  initialData: OrderDetailData;
};

const fetchOrderDetail = async (orderId: string): Promise<OrderDetailData> => {
  const res = await fetch(`/api/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch order details');
  }
  return res.json();
};

export function OrderDetailClientPage({ initialData }: OrderDetailClientPageProps) {
  const { data, isLoading } = useQuery<OrderDetailData>({
    queryKey: ['order', initialData.order.orderId],
    queryFn: () => fetchOrderDetail(initialData.order.orderId),
    initialData: initialData,
  });

  const { order, physicalization } = data;
  
  // Determine the most relevant status for the timeline
  const timelineStatus: TimelineStatus = physicalization?.status || order.status;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
          <CardDescription>Order ID: {order.orderId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="my-8">
             <OrderTimeline status={timelineStatus} />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
               <h3 className="font-semibold text-lg">Artwork</h3>
               <div className="flex items-center gap-4 p-4 border rounded-md">
                   <Image
                       src={order.work.media[0].url}
                       alt={order.work.title}
                       width={80}
                       height={100}
                       className="object-cover rounded-md aspect-[4/5]"
                   />
                   <div>
                       <p className="font-bold">{order.work.title}</p>
                       <p className="text-sm text-muted-foreground">by {order.work.creator.displayName}</p>
                   </div>
               </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Summary</h3>
              <div className="p-4 border rounded-md space-y-2">
                <p><strong>Price:</strong> {order.price} {order.currency}</p>
                <p><strong>Purchase Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
                <p><strong>Buyer:</strong> <span className="text-xs font-mono">{order.buyer.address}</span></p>
              </div>
            </div>
          </div>

          {physicalization && (
            <div>
              <h3 className="font-semibold text-lg">Physicalization Details</h3>
              <div className="p-4 mt-2 border rounded-md space-y-2">
                <p><strong>Status:</strong> {physicalization.status}</p>
                <p><strong>Request Date:</strong> {new Date(physicalization.requestDate).toLocaleDateString()}</p>
                {physicalization.shippingInfo && (
                  <>
                    <p><strong>Carrier:</strong> {physicalization.shippingInfo.carrier}</p>
                    <p><strong>Tracking:</strong> <a href="#" className="text-primary underline">{physicalization.shippingInfo.trackingNumber}</a></p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="text-center pt-4">
            <Link href="/profile" passHref>
                <Button variant="outline">Back to Profile</Button>
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
