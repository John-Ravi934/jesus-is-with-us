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
