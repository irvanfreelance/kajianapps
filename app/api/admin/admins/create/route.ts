import { NextResponse } from 'next/server';
import { createAdmin } from '@/lib/services/admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const result = await createAdmin(data);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
