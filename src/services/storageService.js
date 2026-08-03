import { supabase } from '../lib/supabase';

export const uploadPoster = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `posters/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('rhema-posters')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data } = supabase.storage
    .from('rhema-posters')
    .getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    filePath
  };
};

export const uploadImage = async (file, folder = 'images') => {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('rhema-posters')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from('rhema-posters')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const listPosters = async () => {
  const { data, error } = await supabase.storage
    .from('rhema-posters')
    .list('posters', {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) throw new Error(error.message);
  
  // Exclude the placeholder file '.emptyFolderPlaceholder' if it exists
  const files = data.filter(f => f.name !== '.emptyFolderPlaceholder');
  
  // Return with full public URLs
  return files.map(file => {
    const { data: { publicUrl } } = supabase.storage.from('rhema-posters').getPublicUrl(`posters/${file.name}`);
    return { ...file, publicUrl };
  });
};

export const deletePoster = async (fileName) => {
  const { error } = await supabase.storage
    .from('rhema-posters')
    .remove([`posters/${fileName}`]);

  if (error) throw new Error(error.message);
  return true;
};
