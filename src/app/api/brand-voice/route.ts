import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const BrandVoiceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  examples: z.string().min(1, 'Examples are required').max(5000, 'Examples too long'),
  tone: z.string().max(300).optional(),
  vocabulary: z.string().max(300).optional(),
  personality: z.string().max(300).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

        const { data: voices, error } = await supabase
      .from('brand_voices')
      .select('id, name, tone, vocabulary, personality, description, examples, is_active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ voices: voices || [] });
  } catch (error: any) {
    console.error('[Brand Voice API] GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = BrandVoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { name, examples, tone, vocabulary, personality, description } = parsed.data;

    const { data, error } = await supabase
      .from('brand_voices')
      .insert({
        user_id: user.id,
        name,
        examples,
        tone: tone || null,
        vocabulary: vocabulary || null,
        personality: personality || null,
        description: description || null,
        is_active: false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ voice: data });
  } catch (error: any) {
    console.error('[Brand Voice API] POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rateLimitCheck = checkRateLimit(request as any, 'api')
    if (!rateLimitCheck.allowed) {
      return rateLimitCheck.response!
    }
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Voice ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('brand_voices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Brand Voice API] DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
