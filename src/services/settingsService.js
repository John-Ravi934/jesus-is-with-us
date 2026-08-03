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

export const getDonationSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'donation_settings')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return { 
        upiId: 'jesusiswithus@upi', 
        upiNumber: '98765 43210',
        qrCodeUrl: '',
        bankName: 'State Bank of India',
        accountName: 'Jesus Is With Us Ministries',
        accountNumber: '123456789012',
        ifscCode: 'SBIN0001234',
        branch: 'Salem Main Branch'
      };
    }
    throw error;
  }
  return data.setting_value;
};

export const updateDonationSettings = async (settingsObject) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ setting_key: 'donation_settings', setting_value: settingsObject }, { onConflict: 'setting_key' })
    .select();
  
  if (error) throw error;
  return data[0];
};
