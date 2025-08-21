import { GET as getCreatorOrders } from "@/app/api/creator/orders/route";
import { CreatorOrdersClientPage } from "./creator-orders-client-page";

async function getInitialCreatorOrders() {
  try {
    const res = await getCreatorOrders();
    if (!res.ok) {
      throw new Error("Failed to fetch creator orders");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching initial creator orders:", error);
    return [];
  }
}

export default async function CreatorOrdersPage() {
  const initialOrders = await getInitialCreatorOrders();

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold tracking-tight mb-8">My Orders</h1>
      <CreatorOrdersClientPage initialOrders={initialOrders} />
    </div>
  );
}
