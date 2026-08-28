import { supabase } from '../lib/supabase';

export const SQL_SCRIPT_MESSAGES = `
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  phone TEXT,
  place TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert on contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage contact_messages" ON public.contact_messages FOR ALL USING (auth.role() = 'authenticated');
`;

export const saveMessage = async (data) => {
  const { error } = await supabase
    .from('contact_messages')
    .insert([
      {
        form_type: data.formType || 'General Inquiry',
        full_name: data.fullName,
        email: data.email,
        subject: data.subject || null,
        phone: data.phone || null,
        place: data.place || null,
        message: data.message
      }
    ]);

  if (error) throw error;
};

export const getUnreadMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('status', 'unread')
    .order('created_at', { ascending: false });
    
  if (error) {
    if (error.code === '42P01') {
      // Table doesn't exist yet, return empty
      return [];
    }
    throw error;
  }
  return data;
};

export const markAsRead = async (id) => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ status: 'read' })
    .eq('id', id);

  if (error) throw error;
};

export const markAllAsRead = async () => {
  const { error } = await supabase
    .from('contact_messages')
    .update({ status: 'read' })
    .eq('status', 'unread');

  if (error) throw error;
};

export const getAllMessages = async () => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    if (error.code === '42P01') {
      return [];
    }
    throw error;
  }
  return data;
};

export const deleteMessage = async (id) => {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
