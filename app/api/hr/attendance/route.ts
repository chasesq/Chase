import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    return (getSupabase() as any)[prop];
  },
});

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, employee(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
