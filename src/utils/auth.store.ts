import { create } from 'zustand';
import { supabase, getCurrentProfile } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from './database.types';

type Profile = Database['public']['Tables']['profiles']['Row'] & {
  companies: Database['public']['Tables']['companies']['Row'];
  employee_pins?: Database['public']['Tables']['employee_pins']['Row'];
};

type AuthStore = {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: Error | null;
  demoMode: boolean;
  
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithPin: (phoneNumber: string, pin: string) => Promise<void>;
  setupPin: (phoneNumber: string, pin: string) => Promise<void>;
  updateProfile: (data: Partial<Database['public']['Tables']['profiles']['Update']>) => Promise<void>;
  signOut: () => Promise<void>;
  setDemoMode: (value: boolean) => void;
  
  registerCompany: (data: {
    companyName: string;
    companyCode: string;
    adminEmail: string;
    adminPassword: string;
    adminFullName: string;
  }) => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  error: null,
  demoMode: false,

  setDemoMode: (value: boolean) => set({ demoMode: value }),

  initialize: async () => {
    try {
      const demoMode = localStorage.getItem('demoMode') === 'true';
      if (demoMode) {
        console.log('Initializing in demo mode');
        set({ 
          demoMode,
          isLoading: false,
          user: { id: 'demo-user-id' } as User,
          profile: {
            id: 'demo-user-id',
            full_name: 'Demo HR Admin',
            company_id: 'demo-company-id',
            companies: {
              id: 'demo-company-id',
              name: 'Demo Company Inc.',
              code: 'demo-co'
            },
            role: 'hr_admin',
            pin_set: true,
            communication_channels: ['email', 'whatsapp']
          } as unknown as Profile
        });
        return;
      }
      
      // Normal initialization
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getCurrentProfile();
        set({ user, profile, isLoading: false });
      } else {
        set({ user: null, profile: null, isLoading: false });
      }
    } catch (error) {
      set({ error: error as Error, isLoading: false });
    }
  },
  
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const profile = await getCurrentProfile();
      set({ user: data.user, profile, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      // Double-check that isLoading is definitely set to false
      setTimeout(() => set({ isLoading: false }), 100);
      throw error;
    }
  },

  setupPin: async (phoneNumber: string, pin: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get profile by phone number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (profileError) throw new Error('Profile not found');

      // Create or update PIN
      const { error: pinError } = await supabase
        .from('employee_pins')
        .upsert({
          profile_id: profile.id,
          pin_hash: pin, // In real app, this should be hashed
        });

      if (pinError) throw pinError;

      set({ isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data: Partial<Database['public']['Tables']['profiles']['Update']>) => {
    try {
      set({ isLoading: true, error: null });
      const { user, profile } = get();
      
      if (!user || !profile) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', profile.id);

      if (error) throw error;

      // Refresh profile
      const updatedProfile = await getCurrentProfile();
      set({ profile: updatedProfile, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Check if phone number is registered
  checkPhoneNumber: async (phoneNumber: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('phone_number', phoneNumber)
        .single();

      if (error) throw new Error('Phone number not registered');

      // Check if PIN is set
      const { data: pinData } = await supabase
        .from('employee_pins')
        .select('pin_set')
        .eq('profile_id', profile.id)
        .single();

      return {
        isRegistered: true,
        isPinSet: pinData?.pin_set || false,
        profile
      };
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithPin: async (phoneNumber: string, pin: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First get the profile by phone number
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, companies(*), employee_pins(*)')
        .eq('phone_number', phoneNumber)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Verify PIN
      if (!profile.employee_pins) {
        throw new Error('PIN not set. Please complete registration via WhatsApp.');
      }

      if (profile.employee_pins.pin_hash !== pin) {
        throw new Error('Invalid PIN');
      }

      // Create session for employee
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: `${phoneNumber}@temp.imani.io`,
        password: pin,
      });

      if (sessionError) throw sessionError;

      set({ user: sessionData.user, profile, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Verify PIN for registered phone number
  verifyPin: async (phoneNumber: string, pin: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First get the profile by phone number
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('phone_number', phoneNumber)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Then verify the PIN
      const { data: pinData } = await supabase
        .from('employee_pins')
        .select('*')
        .eq('profile_id', profile.id)
        .single();

      if (!pinData?.pin_set) {
        throw new Error('PIN not set. Please complete registration via WhatsApp.');
      }

      if (!pinData.pin_hash || pinData.pin_hash !== pin) {
        throw new Error('Invalid PIN');
      }

      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      // If in demo mode, just clear the demo flag
      if (get().demoMode) {
        localStorage.removeItem('demoMode');
        set({ user: null, profile: null, isLoading: false, demoMode: false });
        return;
      }
      
      await supabase.auth.signOut();
      set({ user: null, profile: null, isLoading: false });
    } catch (error) {
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  registerCompany: async ({
    companyName,
    companyCode,
    adminEmail,
    adminPassword,
    adminFullName,
  }) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Starting company registration process using RPC function...');

      // Use the SECURITY DEFINER function that bypasses RLS during initial setup
      const { data, error } = await supabase.rpc('register_company_and_admin', {
        company_name: companyName,
        company_code: companyCode,
        full_name: adminFullName,
        email: adminEmail,
        phone_number: '', // No phone number for initial admin
        password: adminPassword
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }
      
      console.log('Company and admin registered successfully, now signing in...');
      
      // Now sign in with the new credentials
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      
      if (signInError) {
        console.error('Sign in error after registration:', signInError);
        throw signInError;
      }
      
      // Get the profile
      const profile = await getCurrentProfile();
      console.log('Retrieved profile after registration:', profile);

      set({ user: authData.user, profile, isLoading: false });
    } catch (error: any) {
      console.error('Registration error:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
}));
