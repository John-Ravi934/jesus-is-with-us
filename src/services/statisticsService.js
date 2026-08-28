import { supabase } from '../lib/supabase';

export const getAppStatistics = async (dateFilter = 'all') => {
  // Calculate the date range based on filter
  let query = supabase
    .from('rhema_words')
    .select('views, downloads, date');

  if (dateFilter !== 'all') {
    const now = new Date();
    let startDate;
    
    if (dateFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (dateFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateFilter === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (startDate) {
      const startStr = startDate.toISOString().split('T')[0];
      query = query.gte('date', startStr);
    }
  }

  const { data, error } = await query;
    
  if (error) {
    console.error("Error fetching rhema statistics:", error);
    return { total_views: 0, total_downloads: 0, total_visitors: 0 };
  }
  
  let total_views = 0;
  let total_downloads = 0;
  
  if (data) {
    data.forEach(word => {
      total_views += (word.views || 0);
      total_downloads += (word.downloads || 0);
    });
  }
  
  return { total_views, total_downloads, total_visitors: 0 };
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
