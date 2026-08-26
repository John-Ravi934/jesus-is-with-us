import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: subs } = await supabase.from('subscribers').select('id').limit(1);
  if (subs && subs.length > 0) {
    const { data, error } = await supabase.from('subscribers').update({ status: 'Deactive' }).eq('id', subs[0].id);
    console.log("Update Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("No subscribers found");
  }
}
test();
