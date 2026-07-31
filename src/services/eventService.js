import { supabase } from '../lib/supabase';

// Get all events (can filter by status or is_announcement)
export const getEvents = async (filters = {}) => {
  let query = supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true }); // Default sort by date

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.is_announcement !== undefined) {
    query = query.eq('is_announcement', filters.is_announcement);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Create a new event
export const createEvent = async (eventData) => {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select();
    
  if (error) throw error;
  return data[0];
};

// Update an existing event
export const updateEvent = async (id, eventData) => {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id)
    .select();
    
  if (error) throw error;
  return data[0];
};

// Delete an event
export const deleteEvent = async (id) => {
  // Try to find the event first to get the image_url
  const { data: eventData } = await supabase
    .from('events')
    .select('image_url')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);
    
  if (error) throw error;

  // Cleanup the image from the bucket if it exists
  if (eventData && eventData.image_url) {
    try {
      // image_url is usually a full URL, we need to extract the path.
      // E.g. https://<project>.supabase.co/storage/v1/object/public/events/file.jpg
      const urlParts = eventData.image_url.split('/events/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('events').remove([filePath]);
      }
    } catch (e) {
      console.warn("Failed to delete event image from bucket", e);
    }
  }

  return true;
};
