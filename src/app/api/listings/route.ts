import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mockWorks } from '@/app/api/mock/data';

const listingSchema = z.object({
  workId: z.string(),
  editionId: z.number(),
  price: z.number().positive(),
  currency: z.string(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = listingSchema.parse(json);

    console.log('Received new listing:', body);

    const workIndex = mockWorks.findIndex(w => w.id === body.workId);
    if (workIndex === -1) {
      return NextResponse.json({ message: 'Work not found' }, { status: 404 });
    }

    // In a real app, you would update the database. Here we just modify the mock data.
    mockWorks[workIndex].status = 'listed';
    const editionIndex = mockWorks[workIndex].editions.findIndex(e => e.editionId === body.editionId);
    if (editionIndex !== -1) {
        mockWorks[workIndex].editions[editionIndex].price = body.price;
        mockWorks[workIndex].editions[editionIndex].currency = body.currency;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      listingId: `list_${Math.random().toString(36).substr(2, 9)}`,
      status: 'listed',
      updatedWork: mockWorks[workIndex],
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    console.error('Failed to create listing:', error);
    return NextResponse.json({ message: 'Failed to create listing' }, { status: 500 });
  }
}
