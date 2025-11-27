
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const SUPABASE_URL = 'https://urwmqmopurcqynumfnah.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyd21xbW9wdXJjcXludW1mbmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxOTc4NTMsImV4cCI6MjA3OTc3Mzg1M30.-MoRTMJ50Au5Zvy15R5XCKG9OdueVnXSuOoYfS3FdZ4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface DBProject {
  id: string;
  user_id: string;
  name: string;
  html: string;
  original_image?: string;
  created_at: string;
}

// Get or create a unique ID for this browser session to simulate a logged-in user
export const getUserId = () => {
  try {
    let uid = localStorage.getItem('gemini_saas_user_id');
    if (!uid) {
      // If no ID, we return null to signify not logged in
      return null; 
    }
    return uid;
  } catch (e) {
    console.error("Local storage access denied", e);
    return null;
  }
};

export const setUserId = (name: string) => {
    try {
        // Generate a stable ID based on random but store name
        const uid = crypto.randomUUID();
        localStorage.setItem('gemini_saas_user_id', uid);
        localStorage.setItem('gemini_saas_user_name', name);
        return uid;
    } catch (e) {
        throw new Error("Could not save session. Please check browser privacy settings.");
    }
}

export const getUserName = () => {
    try {
        return localStorage.getItem('gemini_saas_user_name') || 'User';
    } catch (e) {
        return 'User';
    }
}

const handleSupabaseError = (error: any, context: string) => {
    console.error(`Supabase Error [${context}]:`, error);
    
    // Check for network errors
    if (error.message && (error.message.includes('FetchError') || error.message.includes('Network request failed'))) {
        throw new Error("Network error. Please check your internet connection.");
    }
    
    // Check for RLS or permission errors
    if (error.code === '42501') {
        throw new Error("Permission denied. You might need to sign in again.");
    }

    throw new Error(error.message || "Database operation failed. Please try again.");
};

export const api = {
  /**
   * Fetch all projects for the current user
   */
  getProjects: async (): Promise<DBProject[]> => {
    const userId = getUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('creations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'getProjects');
      return [];
    }
    return data || [];
  },

  /**
   * Fetch a single project by ID (Public Read)
   * This allows sharing links to work even without being logged in as that user
   */
  getPublicProject: async (id: string): Promise<DBProject | null> => {
    const { data, error } = await supabase
        .from('creations')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        // Don't throw for public fetch, just return null so UI handles 404
        console.warn('Could not fetch public project', error);
        return null;
    }
    return data;
  },

  /**
   * Create a new project
   */
  createProject: async (project: Omit<DBProject, 'id' | 'created_at' | 'user_id'>) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('creations')
      .insert([
        {
          ...project,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'createProject');
      return null;
    }
    return data;
  },

  /**
   * Update an existing project (Name or Content)
   */
  updateProject: async (id: string, updates: Partial<DBProject>) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('creations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
        handleSupabaseError(error, 'updateProject');
        return null;
    }
    return data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (id: string) => {
    const userId = getUserId();
    if (!userId) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('creations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      handleSupabaseError(error, 'deleteProject');
    }
  }
};
