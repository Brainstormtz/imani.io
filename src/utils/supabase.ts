import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Initialize the Supabase client using environment variables

// Use the correct Supabase URL and anon key
const supabaseUrl = "https://oybvgqoquamizxnqloen.supabase.co";

// We need the correct anon key to match this URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YnZncW9xdWFtaXp4bnFsb2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxNTI2NjIsImV4cCI6MjA1MzcyODY2Mn0.ynFbxglYEVZXD9XCexM5DnIBfMBM76ozn4SC-ITDd1c";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Role types
export type UserRole = 'hr_admin' | 'manager' | 'employee';

// Helper to get current user profile
export const getCurrentProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        *,
        companies(*),
        employee_pins(*)
      `)
      .eq('id', user.id)
      .single();

    return profile;
  } catch (error) {
    console.error("Error getting current profile:", error);
    return null;
  }
};

// Helper to check if user has required role
export async function checkUserRole(requiredRole: UserRole | UserRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(profile.role as UserRole);
}
