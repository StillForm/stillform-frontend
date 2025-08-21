import { NextResponse } from 'next/server';
import { mockPhysicalizations } from '@/app/api/mock/data';

export async function GET() {
  return NextResponse.json(mockPhysicalizations);
}
