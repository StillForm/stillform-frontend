import { NextRequest, NextResponse } from "next/server";
import { mockWorks } from "@/app/api/mock/data";

export async function POST(req: NextRequest) {
  try {
    const { workId } = await req.json();

    if (!workId) {
      return NextResponse.json({ message: "Work ID is required" }, { status: 400 });
    }

    const workIndex = mockWorks.findIndex(w => w.id === workId);

    if (workIndex === -1) {
      return NextResponse.json({ message: "Work not found" }, { status: 404 });
    }

    // In a real scenario, you'd update the ownership status, lock the token on-chain, etc.
    // For now, we'll just log it and simulate a success response.
    console.log(`Physicalization requested for work ID: ${workId}`);
    
    // You might want to change the work's status in the mock data if you want to reflect this change
    // For example: mockWorks[workIndex].status = 'physicalizing';

    return NextResponse.json({ message: "Physicalization request successful" }, { status: 200 });

  } catch (error) {
    console.error("Failed to process physicalization request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
