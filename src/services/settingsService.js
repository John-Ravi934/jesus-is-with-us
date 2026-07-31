import { supabase } from '../lib/supabase';

export const getLiveStreamSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'live_stream')
    .single();
  
  if (error) {
    // Return defaults if not found
    if (error.code === 'PGRST116') {
      return { is_active: false, link: '', tooltip: 'Live started in the youtube' };
    }
    throw error;
  }
  return data.setting_value;
};

export const updateLiveStreamSettings = async (settingsObject) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ setting_key: 'live_stream', setting_value: settingsObject }, { onConflict: 'setting_key' })
    .select();
  
  if (error) throw error;
  return data[0];
};
