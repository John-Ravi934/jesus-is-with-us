import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')
// WARNING: To update a row and bypass RLS (if active), we need the SERVICE_ROLE_KEY, not ANON_KEY.
// Webhooks are trusted server-side environments.
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Received Webhook Payload:", payload)

    const { type, table, record, old_record } = payload

    // Only process INSERT or UPDATE events
    if (type !== 'INSERT' && type !== 'UPDATE') {
      return new Response("Ignored: Event type is not INSERT or UPDATE", { status: 200 })
    }

    const updates: Record<string, string> = {}

    // Helper function to translate text using MyMemory
    const translateText = async (text: string) => {
      if (!text || text.trim() === '' || text.includes('<!--NO_DETAILS-->')) return '';
      
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ta`
      const response = await fetch(url)
      const data = await response.json()
  
      if (!response.ok) {
         throw new Error(`MyMemory API error: ${JSON.stringify(data)}`)
      }
  
      let translatedText = data.responseData?.translatedText
      if (!translatedText || translatedText.trim() === '') {
          const fallbackMatch = data.matches?.find((m: any) => m.translation && m.translation.trim() !== '')
          if (fallbackMatch) {
              translatedText = fallbackMatch.translation
          }
      }
      return translatedText || '';
    }

    // Check if we need to translate a specific pair of columns
    const processField = async (enField: string, taField: string) => {
      const enText = record[enField];
      const taText = record[taField];
      
      // If the English field doesn't exist on this table, skip it
      if (enText === undefined || enText === null) return;
      
      let needsTranslation = false;

      if (type === 'INSERT') {
        // Translate if Tamil is empty
        if (!taText || taText.trim() === '') needsTranslation = true;
      } else if (type === 'UPDATE' && old_record) {
        // Translate if English changed, OR if Tamil is empty
        if (enText !== old_record[enField]) needsTranslation = true;
        if (!taText || taText.trim() === '') needsTranslation = true;
      }

      if (needsTranslation) {
        console.log(`Translating ${enField}: "${enText}" to Tamil...`)
        const translated = await translateText(enText)
        if (translated) {
           updates[taField] = translated;
           console.log(`Result for ${taField}: "${translated}"`)
        }
      }
    }

    // Process common fields for translation
    await processField('title_en', 'title_ta');
    await processField('title', 'title_ta'); // For tables still using title
    await processField('description_en', 'description_ta');
    await processField('description', 'description_ta'); // For tables still using description
    await processField('name', 'name_ta'); // For category tables etc
    await processField('bible_verse_en', 'bible_verse_ta'); // For rhema_words

    if (Object.keys(updates).length === 0) {
       return new Response("Ignored: No fields required translation or fields haven't changed.", { status: 200 })
    }

    // Update the row in Supabase
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    
    // We update the same table and the exact row using the record's ID
    const { error } = await supabase
      .from(table)
      .update(updates)
      .eq('id', record.id)

    if (error) {
        throw new Error(`Supabase Update Error: ${error.message}`)
    }

    console.log("Successfully updated Supabase row with translations!")

    return new Response(JSON.stringify({ success: true, updates }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("Error in Edge Function:", error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
