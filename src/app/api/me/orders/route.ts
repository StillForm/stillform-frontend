import { NextResponse } from 'next/server';
import { mockOrders } from '@/app/api/mock/data';

export async function GET() {
  return NextResponse.json(mockOrders);
}
