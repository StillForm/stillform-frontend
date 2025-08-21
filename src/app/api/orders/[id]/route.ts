import { NextRequest, NextResponse } from "next/server";
import { mockOrders, mockPhysicalizations } from "@/app/api/mock/data";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    const order = mockOrders.find(o => o.orderId === orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Also find the associated physicalization request, if any
    const physicalization = mockPhysicalizations.find(p => p.orderId === orderId);

    return NextResponse.json({ order, physicalization });

  } catch (error) {
    console.error(`Failed to fetch order ${params.id}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
