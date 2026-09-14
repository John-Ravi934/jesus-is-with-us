import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * A custom React hook to sync data in real-time from Supabase.
 * 
 * @param {string} table The name of the table to listen to.
 * @param {function} callback The function to call when a change occurs.
 * @param {string} filter Optional filter for the subscription (e.g., "setting_key=eq.donation_details")
 */
export function useRealtimeSync(table, callback, filter = null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!table) return;

    let opts = { event: '*', schema: 'public', table };
    if (filter) {
      opts.filter = filter;
    }
    
    // Create a unique channel name to prevent collisions if the same table is subscribed to multiple times
    const channelName = `realtime_${table}_${Math.random().toString(36).substring(7)}`;
    
    const channel = supabase.channel(channelName)
      .on('postgres_changes', opts, (payload) => {
        if (savedCallback.current) {
          savedCallback.current(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);
}
