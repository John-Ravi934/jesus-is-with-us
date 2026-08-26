import { supabase } from '../lib/supabase';

// Helper to generate slug
const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
    
  if (error) throw new Error(error.message);
  return data;
};

export const addCategory = async (name, color = '#2E7D32', icon = 'Tag') => {
  const slug = generateSlug(name);
  
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name, slug, color, icon }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') { // Foreign key violation
      throw new Error("Cannot delete category because it is in use by one or more Rhema words.");
    }
    throw new Error(error.message);
  }
  return true;
};

export const updateCategory = async (id, name, color, icon = 'Tag') => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug, color, icon })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
