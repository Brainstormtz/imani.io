import { create } from 'zustand';
import { supabase } from './supabase';
import type { Database } from './database.types';
import { useAuthStore } from './auth.store';

type Communication = Database['public']['Tables']['communications']['Row'];
type NewCommunication = Database['public']['Tables']['communications']['Insert'];

type CommunicationsStore = {
  communications: Communication[];
  isLoading: boolean;
  error: Error | null;
  demoMode: boolean;
  // Fetch communications for current user (as employee or manager/admin)
  fetchCommunications: () => Promise<void>;
  // Create new communication
  createCommunication: (data: NewCommunication) => Promise<void>;
  // Update communication status (for managers/admins)
  updateCommunicationStatus: (id: string, status: Communication['status']) => Promise<void>;
  // Initialize demo mode with sample data
  initDemoMode: () => void;
};

// Sample data for demo mode
const sampleCommunications: Communication[] = [
  {
    id: 'comm-1',
    employee_id: 'emp-1',
    channel: 'whatsapp',
    type: 'leave_request',
    content: JSON.stringify({
      startDate: new Date(Date.now() + 86400000 * 7).toISOString(), // A week from now
      endDate: new Date(Date.now() + 86400000 * 10).toISOString(), // 10 days from now
      reason: 'vacation'
    }),
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'comm-2',
    employee_id: 'emp-1',
    channel: 'whatsapp',
    type: 'payment_advance',
    content: JSON.stringify({
      amount: '5000',
      reason: 'Medical expenses'
    }),
    status: 'approved',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
  },
  {
    id: 'comm-3',
    employee_id: 'emp-1',
    channel: 'whatsapp',
    type: 'complaint',
    content: 'I would like to report an issue with the office facilities. The air conditioning in the east wing has been broken for two weeks now.',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(), // 20 days ago
    updated_at: new Date(Date.now() - 86400000 * 15).toISOString() // 15 days ago
  }
];

export const useCommunicationsStore = create<CommunicationsStore>((set, get) => ({
  communications: [],
  isLoading: false,
  error: null,
  demoMode: false,

  // Initialize demo mode with sample data
  initDemoMode: () => {
    console.log('Initializing demo mode for communications');
    set({ 
      demoMode: true,
      communications: sampleCommunications,
      isLoading: false 
    });
  },

  // Fetch communications - either from Supabase or demo data
  fetchCommunications: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check for demo mode from the auth store
      const { demoMode: authDemoMode } = useAuthStore.getState();
      if (authDemoMode || get().demoMode) {
        console.log('Using demo mode for communications');
        if (!get().demoMode) {
          get().initDemoMode();
        } else {
          set({ isLoading: false });
        }
        return;
      }
      
      const { data, error } = await supabase
        .from('communications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ communications: data, isLoading: false });
    } catch (error) {
      console.error('Error fetching communications:', error);
      set({ error: error as Error, isLoading: false });
      
      // If there's a connection error, try to use demo mode
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('network') || 
          errorMsg.includes('policy') || errorMsg.includes('violates') || errorMsg.includes('row-level security')) {
        console.log('Switching to demo mode for communications due to connection error');
        get().initDemoMode();
        return;
      }
      
      throw error;
    }
  },

  createCommunication: async (data: NewCommunication) => {
    try {
      set({ isLoading: true, error: null });

      // Check for demo mode
      const { demoMode: authDemoMode } = useAuthStore.getState();
      if (get().demoMode || authDemoMode) {
        // Create a new mock communication
        const newComm: Communication = {
          id: `comm-${Date.now()}`,
          employee_id: data.employee_id,
          channel: data.channel,
          type: data.type,
          content: data.content,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add it to our sample communications
        const updatedComms = [newComm, ...get().communications];
        set({ communications: updatedComms, isLoading: false });
        return;
      }

      const { error } = await supabase
        .from('communications')
        .insert([{ ...data, status: 'pending' }]);

      if (error) throw error;

      // Refresh communications list
      await get().fetchCommunications();
    } catch (error) {
      console.error('Error creating communication:', error);
      set({ error: error as Error, isLoading: false });
      
      // If there's a connection error, try to use demo mode
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('network') || 
          errorMsg.includes('policy') || errorMsg.includes('violates') || errorMsg.includes('row-level security')) {
        console.log('Switching to demo mode for communications due to connection error');
        get().initDemoMode();
        return;
      }
      
      throw error;
    }
  },

  updateCommunicationStatus: async (id: string, status: Communication['status']) => {
    try {
      set({ isLoading: true, error: null });

      // Check for demo mode
      const { demoMode: authDemoMode } = useAuthStore.getState();
      if (get().demoMode || authDemoMode) {
        // Update the status in our sample communications
        const updatedComms = get().communications.map(comm => 
          comm.id === id ? { ...comm, status, updated_at: new Date().toISOString() } : comm
        );
        set({ communications: updatedComms, isLoading: false });
        return;
      }

      const { error } = await supabase
        .from('communications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      // Refresh communications list
      await get().fetchCommunications();
    } catch (error) {
      console.error('Error updating communication status:', error);
      set({ error: error as Error, isLoading: false });
      
      // If there's a connection error, try to use demo mode
      const errorMsg = (error as Error).message;
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('network') || 
          errorMsg.includes('policy') || errorMsg.includes('violates') || errorMsg.includes('row-level security')) {
        console.log('Switching to demo mode for communications due to connection error');
        get().initDemoMode();
        return;
      }
      
      throw error;
    }
  },
}));
