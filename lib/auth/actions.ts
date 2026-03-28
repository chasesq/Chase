'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signOut() {
  const supabase = createClient()
  
  // Note: The server client uses service role key which doesn't have auth methods
  // We need to use the regular client for auth operations
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
}
