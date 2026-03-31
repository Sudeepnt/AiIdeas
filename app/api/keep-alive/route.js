import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Insert the 'hi' message into the keep_alive table
    const { data, error } = await supabase
      .from('keep_alive')
      .insert([{ message: 'hi' }])
      .select();
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Keep alive ping sent successfully to Supabase!',
      data
    });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
