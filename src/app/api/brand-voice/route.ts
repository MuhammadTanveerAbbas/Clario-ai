import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('[Brand Voice API] GET request received');
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Brand Voice API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Brand Voice API] User authenticated:', user.id);

    const { data: voices, error } = await supabase
      .from('brand_voices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Brand Voice API] Database error:', error);
      throw error;
    }

    console.log('[Brand Voice API] Found', voices?.length || 0, 'voices');
    return NextResponse.json({ voices: voices || [] });
  } catch (error: any) {
    console.error('[Brand Voice API] GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log('[Brand Voice API] POST request received');
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Brand Voice API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Brand Voice API] User authenticated:', user.id);

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('[Brand Voice API] JSON parse error:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { name, examples } = body;

    if (!name || !examples) {
      console.log('[Brand Voice API] Missing required fields');
      return NextResponse.json({ error: 'Name and examples are required' }, { status: 400 });
    }

    console.log('[Brand Voice API] Creating voice:', name);

    const { data, error } = await supabase
      .from('brand_voices')
      .insert({
        user_id: user.id,
        name,
        examples,
        is_active: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[Brand Voice API] Insert error:', error);
      throw error;
    }

    console.log('[Brand Voice API] Voice created successfully');
    return NextResponse.json({ voice: data });
  } catch (error: any) {
    console.error('[Brand Voice API] POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  console.log('[Brand Voice API] DELETE request received');
  
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Brand Voice API] Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Brand Voice API] User authenticated:', user.id);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('[Brand Voice API] Missing voice ID');
      return NextResponse.json({ error: 'Voice ID required' }, { status: 400 });
    }

    console.log('[Brand Voice API] Deleting voice:', id);

    const { error } = await supabase
      .from('brand_voices')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[Brand Voice API] Delete error:', error);
      throw error;
    }

    console.log('[Brand Voice API] Voice deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Brand Voice API] DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
