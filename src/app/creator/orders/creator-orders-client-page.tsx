"use client";

import { useState } from "react";
import { Order } from "@/app/api/mock/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type CreatorOrdersClientPageProps = {
  initialOrders: Order[];
};

export function CreatorOrdersClientPage({ initialOrders }: CreatorOrdersClientPageProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold">No Orders Yet</h2>
        <p className="text-muted-foreground mt-2">When buyers purchase your work, the orders will appear here.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Sales</CardTitle>
        <CardDescription>A list of all sales from your artworks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Artwork</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="font-medium">{order.work.title}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.orderId}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.buyer.address}</TableCell>
                <TableCell>{order.price} {order.currency}</TableCell>
                <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/orders/${order.orderId}`} passHref>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
