import { supabase } from '../lib/supabase';

export const getPlaylists = async () => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createPlaylist = async (playlistData) => {
  const { data, error } = await supabase
    .from('playlists')
    .insert([playlistData])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const updatePlaylist = async (id, playlistData) => {
  const { data, error } = await supabase
    .from('playlists')
    .update(playlistData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data[0];
};

export const deletePlaylist = async (id) => {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};
