import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ActivateVoiceSchema = z.object({
  id: z.string().uuid('Invalid voice ID'),
});

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

    const parsed = ActivateVoiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    }

    const { id } = parsed.data;

    // Deactivate all voices before activating the selected one (only one active at a time)
    await supabase
      .from('brand_voices')
      .update({ is_active: false })
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('brand_voices')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Brand Voice Activate] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
