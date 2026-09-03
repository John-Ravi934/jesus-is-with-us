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

export const getEmailSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'email_settings')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return { 
        resendApiKey: '',
        fromEmail: 'noreply@yourdomain.com',
        replyToEmail: 'contact@yourdomain.com'
      };
    }
    throw error;
  }
  return data.setting_value;
};

export const updateEmailSettings = async (settingsObject) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ setting_key: 'email_settings', setting_value: settingsObject }, { onConflict: 'setting_key' })
    .select();
  
  if (error) throw error;
  return data[0];
};

export const getQuickAccessSettings = async () => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'quick_access_buttons')
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return [
        { id: 1, icon: 'MessageCircle', link: 'https://wa.me/1234567890', color: '#25D366', tooltip: 'WhatsApp AI chat', isExternal: true },
        { id: 2, icon: 'Heart', link: '/rhema?tab=favorites', color: 'linear-gradient(135deg, #e80980 0%, #ffec1f 100%)', tooltip: 'Favorite Rhema Words', isExternal: false },
        { id: 3, icon: 'Music', link: '/worship', color: '#2e2bcf', tooltip: 'Live Worship', isExternal: false }
      ];
    }
    throw error;
  }
  return data.setting_value;
};

export const updateQuickAccessSettings = async (settingsArray) => {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ setting_key: 'quick_access_buttons', setting_value: settingsArray }, { onConflict: 'setting_key' })
    .select();
  
  if (error) throw error;
  return data[0];
};
