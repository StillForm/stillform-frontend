import { NextResponse } from 'next/server';
import { z } from 'zod';

const orderSchema = z.object({
  workId: z.string(),
  editionId: z.number(),
  quantity: z.number().int().positive(),
  buyerAddress: z.string(), // In a real app, this would come from the session
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = orderSchema.parse(json);

    console.log('Received new order:', body);

    // Simulate database and blockchain interaction
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      orderId: `ord_${Math.random().toString(36).substr(2, 9)}`,
      status: 'completed',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: 'Failed to create order' }, { status: 500 });
  }
}
