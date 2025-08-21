import { NextRequest, NextResponse } from "next/server";
import { mockOrders, mockWorks } from "@/app/api/mock/data";

// This is a mock endpoint. In a real application, you'd fetch this
// based on the authenticated creator's session.
export async function GET(req: NextRequest) {
  try {
    // For this mock, we'll assume a hardcoded creator address/ID
    const MOCK_CREATOR_ADDRESS = "0xABC...123";
    
    // Find all works by this creator
    const creatorWorkIds = mockWorks
      .filter(work => work.creator.address === MOCK_CREATOR_ADDRESS)
      .map(work => work.id);

    // Filter orders to only include those for the creator's works
    const creatorOrders = mockOrders.filter(order => creatorWorkIds.includes(order.work.id));
    
    return NextResponse.json(creatorOrders);

  } catch (error) {
    console.error("Failed to fetch creator orders:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
