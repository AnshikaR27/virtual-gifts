import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { giftId, type, value } = body as Record<string, unknown>;

  if (typeof giftId !== 'string' || !UUID_RE.test(giftId)) {
    return NextResponse.json({ error: 'Invalid giftId' }, { status: 400 });
  }

  if (typeof type !== 'string' || type.length === 0 || type.length > 100) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('interactions').insert({
    gift_id: giftId,
    type,
    value: value !== undefined ? (value as Json) : null,
  });

  if (error) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
