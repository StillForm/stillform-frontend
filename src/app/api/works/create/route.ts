import { NextResponse } from 'next/server';
import { workSchema } from '@/lib/validators/work';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = workSchema.parse(json);

    // Log differently based on the type of work
    if (body.workType === 'standard') {
      console.log('Received new STANDARD work:', body);
    } else {
      console.log('Received new BLINDBOX work:', body);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // The mock response is fine as is, since it just returns the parsed body
    return NextResponse.json({
      id: `work_${Math.random().toString(36).substr(2, 9)}`,
      ...body
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.errors }, { status: 400 });
    }
    console.error('Failed to create work:', error);
    return NextResponse.json({ message: 'Failed to create work' }, { status: 500 });
  }
}
