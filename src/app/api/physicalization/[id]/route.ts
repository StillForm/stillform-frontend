import { NextRequest, NextResponse } from "next/server";
import { mockPhysicalizations } from "@/app/api/mock/data";

// This endpoint simulates fetching the detailed progress of a physicalization request.
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const physicalizationId = params.id;
    
    const physicalization = mockPhysicalizations.find(p => p.physicalizationId === physicalizationId);

    if (!physicalization) {
      return NextResponse.json({ message: "Physicalization request not found" }, { status: 404 });
    }

    // Mock a timeline based on the current status
    const timeline = [
      { name: "Requested", date: physicalization.requestDate, status: "complete" },
    ];

    if (physicalization.status === 'in_progress' || physicalization.status === 'shipped' || physicalization.status === 'completed') {
        const inProgressDate = new Date(physicalization.requestDate);
        inProgressDate.setDate(inProgressDate.getDate() + 2); // 2 days after request
        timeline.push({ name: "In Progress", date: inProgressDate.toISOString(), status: "complete" });
    }
     if (physicalization.status === 'shipped' || physicalization.status === 'completed') {
        const shippedDate = new Date(physicalization.requestDate);
        shippedDate.setDate(shippedDate.getDate() + 5); // 5 days after request
        timeline.push({ name: "Shipped", date: shippedDate.toISOString(), status: "complete" });
    }
     if (physicalization.status === 'completed') {
        const completedDate = new Date(physicalization.requestDate);
        completedDate.setDate(completedDate.getDate() + 10); // 10 days after request
        timeline.push({ name: "Completed", date: completedDate.toISOString(), status: "complete" });
    }

    return NextResponse.json({
      ...physicalization,
      timeline,
    });

  } catch (error) {
    console.error(`Failed to fetch physicalization progress for ${params.id}:`, error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
