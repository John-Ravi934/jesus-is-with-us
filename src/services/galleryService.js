import { supabase } from "../lib/supabase";

export const getGalleryImages = async () => {
  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const addGalleryImage = async (image_url, title_en = null, title_ta = null, status = 'published') => {
  const { data, error } = await supabase
    .from("gallery_images")
    .insert([{ image_url, title_en, title_ta, status }])
    .select();

  if (error) throw error;
  return data[0];
};

export const updateGalleryImage = async (id, updates) => {
  const { data, error } = await supabase
    .from("gallery_images")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteGalleryImage = async (id) => {
  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};
