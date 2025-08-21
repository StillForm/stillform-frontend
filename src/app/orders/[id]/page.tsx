import { GET } from "@/app/api/orders/[id]/route";
import { notFound } from "next/navigation";
import { OrderDetailClientPage } from "./order-detail-client-page";

async function getOrderDetail(id: string) {
  try {
    const res = await GET(new Request(`http://localhost/api/orders/${id}`), { params: { id } });
    
    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      throw new Error("Failed to fetch order details");
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    return null;
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getOrderDetail(params.id);

  if (!data || !data.order) {
    notFound();
  }

  return (
    <div className="container py-10">
      <OrderDetailClientPage initialData={data} />
    </div>
  );
}
