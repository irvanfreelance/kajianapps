import { NextResponse } from 'next/server';
import { getProductById, getProductBySlug } from '@/lib/services/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');

  if (!id && !slug) {
    return NextResponse.json({ success: false, error: 'ID or Slug required' }, { status: 400 });
  }

  try {
    let product;
    if (slug) {
      product = await getProductBySlug(slug);
    } else {
      product = await getProductById(id!);
    }

    if (!product) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
