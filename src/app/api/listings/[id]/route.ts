import { NextResponse } from 'next/server';
import { mockWorks } from '@/app/api/mock/data';

export async function DELETE(
  req: Request,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const workId = id;
    console.log('Received unlist request for:', workId);

    const workIndex = mockWorks.findIndex(w => w.id === workId);
    if (workIndex === -1) {
      return NextResponse.json({ message: 'Work not found' }, { status: 404 });
    }

    // In a real app, you would update the database. Here we just modify the mock data.
    mockWorks[workIndex].status = 'unlisted';

    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ 
      status: 'unlisted',
      updatedWork: mockWorks[workIndex],
    });

  } catch (error) {
    console.error('Failed to unlist work:', error);
    return NextResponse.json({ message: 'Failed to unlist work' }, { status: 500 });
  }
}
