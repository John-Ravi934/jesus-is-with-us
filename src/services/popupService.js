import { supabase } from '../lib/supabase';

// Get all popups (can filter by status)
export const getPopups = async (filters = {}) => {
  let query = supabase
    .from('popups')
    .select('*')
    .order('created_at', { ascending: false }); // Default sort by newest

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Create a new popup
export const createPopup = async (popupData) => {
  const { data, error } = await supabase
    .from('popups')
    .insert([popupData])
    .select();
    
  if (error) throw error;
  return data[0];
};

// Update an existing popup
export const updatePopup = async (id, popupData) => {
  const { data, error } = await supabase
    .from('popups')
    .update(popupData)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

// Delete a popup
export const deletePopup = async (id) => {
  // Try to find the popup first to get the image_url
  const { data: popupData } = await supabase
    .from('popups')
    .select('image_url')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('popups')
    .delete()
    .eq('id', id);
    
  if (error) throw error;

  // Cleanup the image from the bucket if it exists
  if (popupData && popupData.image_url) {
    try {
      const urlParts = popupData.image_url.split('/popups/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('popups').remove([filePath]);
      }
    } catch (e) {
      console.warn("Failed to delete popup image from bucket", e);
    }
  }

  return true;
};
