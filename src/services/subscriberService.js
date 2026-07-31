import { supabase } from "../lib/supabase";

export const getSubscribers = async () => {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const subscribeEmail = async (email) => {
  const { data, error } = await supabase
    .from("subscribers")
    .insert([{ email }])
    .select();

  if (error) {
    if (error.code === '23505') { // PostgreSQL unique violation code
      throw new Error("This email is already subscribed!");
    }
    throw error;
  }
  return data[0];
};

export const deleteSubscriber = async (id) => {
  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};
