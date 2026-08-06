import { supabase } from '../lib/supabase';

// Helper to generate a slug from the title and date
const generateSlug = (title, date) => {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${baseSlug}-${date}`;
};

export const getRhemaWords = async (filters = {}) => {
  let query = supabase
    .from('rhema_words')
    .select('*')
    .order('date', { ascending: false });
    
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const addRhema = async (data) => {
  const slug = generateSlug(data.title || data.reference, data.date);
  
  // If featured is true, un-feature any other records for this date
  if (data.featured) {
    await supabase
      .from('rhema_words')
      .update({ featured: false })
      .eq('date', data.date);
  }

  const { data: newRecord, error } = await supabase
    .from('rhema_words')
    .insert([{
      ...data,
      slug,
      views: 0,
      downloads: 0
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return newRecord;
};

export const deleteRhema = async (id) => {
  // 1. Fetch the record first to get the poster URL
  const { data: record } = await supabase
    .from('rhema_words')
    .select('poster_url, tamil_poster_url')
    .eq('id', id)
    .single();

  // 2. Delete the database record
  const { error } = await supabase
    .from('rhema_words')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  // 3. Clean up the storage bucket by deleting the image file
  if (record && record.poster_url) {
    // Extract the file path (e.g. 'posters/filename.jpg') from the full public URL
    const urlParts = record.poster_url.split('rhema-posters/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from('rhema-posters').remove([filePath]);
    }
  }

  if (record && record.tamil_poster_url) {
    const urlParts = record.tamil_poster_url.split('rhema-posters/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      await supabase.storage.from('rhema-posters').remove([filePath]);
    }
  }

  return true;
};

export const getRhemaById = async (id) => {
  const { data, error } = await supabase
    .from('rhema_words')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw new Error(error.message);
  return data;
};

export const updateRhema = async (id, updates) => {
  if (updates.featured) {
    await supabase
      .from('rhema_words')
      .update({ featured: false })
      .eq('date', updates.date);
  }

  const { data, error } = await supabase
    .from('rhema_words')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

// RPC Calls
export const incrementViews = async (id) => {
  await supabase.rpc('increment_rhema_views', { poster_id: id });
};

export const incrementDownloads = async (id) => {
  await supabase.rpc('increment_rhema_downloads', { poster_id: id });
};
