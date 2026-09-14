import { supabase } from '../lib/supabase';

export const adminLogin = async (email, password) => {
  // 1. Check server-side lock status
  const { data: statusData, error: statusError } = await supabase.rpc('check_login_status', { p_email: email });
  if (statusError) throw new Error(statusError.message);
  
  if (!statusData.allowed) {
    const err = new Error(`Account locked.`);
    err.lockedUntil = statusData.locked_until;
    throw err;
  }

  // 2. Attempt login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // 3. Record failed login
    const { data: failData } = await supabase.rpc('record_failed_login', { p_email: email });
    if (failData && failData.locked) {
      const err = new Error(`Maximum attempts reached. Account locked.`);
      err.lockedUntil = failData.locked_until;
      throw err;
    } else if (failData && failData.attempts > 0) {
      throw new Error(`${error.message} (Failed attempt ${failData.attempts}/3)`);
    }
    throw new Error(error.message || 'An unexpected service error occurred.');
  }

  // 4. Reset attempts on success
  // The RPC now securely derives identity from the authenticated JWT token
  await supabase.rpc('reset_login_attempts');

  return data;
};

export const adminLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error('An unexpected service error occurred.');
  }
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Set up a listener for auth changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};
