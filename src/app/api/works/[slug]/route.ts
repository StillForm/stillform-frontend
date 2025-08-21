import { NextResponse } from 'next/server';
import { mockWorks } from '@/app/api/mock/data';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const work = mockWorks.find(w => w.slug === params.slug);

    if (!work) {
      return NextResponse.json({ message: 'Work not found' }, { status: 404 });
    }

    return NextResponse.json(work);

  } catch (error) {
    console.error('Failed to fetch work:', error);
    return NextResponse.json({ message: 'Failed to fetch work' }, { status: 500 });
  }
}
