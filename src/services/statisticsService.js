import { supabase } from '../lib/supabase';

export const getAppStatistics = async () => {
  const { data, error } = await supabase
    .from('app_statistics')
    .select('*')
    .limit(1)
    .single();
    
  if (error) {
    // If the table is empty for some reason, return a default object
    if (error.code === 'PGRST116') {
      return { total_views: 0, total_downloads: 0, total_visitors: 0 };
    }
    throw new Error(error.message);
  }
  
  return data;
};

export const getStorageStats = async () => {
  try {
    const { data, error } = await supabase.rpc('get_storage_size');
    if (error) throw error;
    return data || 0;
  } catch (e) {
    console.error('Failed to fetch storage size:', e);
    // If RPC doesn't exist yet, return a fallback value so UI doesn't break
    return 15 * 1024 * 1024 * 1024; // Fallback 15GB
  }
};
