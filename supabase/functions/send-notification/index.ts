import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// You must set RESEND_API_KEY as a secret in your Supabase project
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    // Check if the request method is POST
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 })
    }

    // Parse the payload from the Database Webhook
    const payload = await req.json()
    console.log('Webhook payload received:', payload)

    // The webhook payload from Supabase looks like:
    // { type: 'INSERT', table: 'events', record: { ... }, ... }
    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: "Not an INSERT event, skipping." }), { status: 200 })
    }

    const record = payload.record
    const table = payload.table

    // Create a Supabase client to fetch subscribers
    // We use the service role key to bypass RLS for backend operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email')

    if (subError) {
      throw subError
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers found." }), { status: 200 })
    }

    const emailList = subscribers.map(sub => sub.email)
    console.log(`Preparing to send email to ${emailList.length} subscribers...`)

    // 2. Prepare Email Content based on the table
    let emailSubject = 'New Update from Jesus Is With Us'
    let htmlBody = ''

    if (table === 'events') {
      // It's a new Event or Announcement
      const isAnnouncement = record.is_announcement
      emailSubject = isAnnouncement ? `New Announcement: ${record.title}` : `Upcoming Event: ${record.title}`
      
      const cleanDesc = record.description ? record.description.replace('<!--NO_DETAILS-->', '') : ''

      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f172a;">${record.title}</h2>
          <p><strong>Date:</strong> ${record.event_date ? new Date(record.event_date).toLocaleDateString() : 'TBA'}</p>
          ${record.image_url ? `<img src="${record.image_url}" alt="Poster" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 20px 0;" />` : ''}
          <p style="line-height: 1.6;">${cleanDesc}</p>
          ${record.learn_more_url ? `<a href="${record.learn_more_url}" style="display: inline-block; padding: 12px 24px; background: #fb923c; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 10px;">Learn More</a>` : ''}
        </div>
      `
    } else if (table === 'rhema_words') {
      // It's a new Rhema Word
      emailSubject = `Today's Rhema Word: ${record.title}`
      
      htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; text-align: center;">
          <h2 style="color: #16a34a;">Today's Rhema Word</h2>
          <h3 style="color: #0f172a; margin-bottom: 5px;">${record.title}</h3>
          <p style="color: #64748b; font-size: 0.9em;">${record.scripture_reference || ''}</p>
          ${record.image_url ? `<img src="${record.image_url}" alt="Rhema" style="width: 100%; max-width: 500px; border-radius: 8px; margin: 20px 0; border: 2px solid #e2e8f0;" />` : ''}
          <p style="line-height: 1.6; text-align: left;">${record.content || ''}</p>
        </div>
      `
    } else {
      return new Response(JSON.stringify({ message: "Unsupported table event." }), { status: 200 })
    }

    // 3. Send via Resend API (Send individual emails to protect privacy and avoid BCC limits)
    const sendPromises = emailList.map(email => {
      return fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Jesus Is With Us <onboarding@resend.dev>', // You should change this to a verified domain later
          to: email,
          subject: emailSubject,
          html: htmlBody,
        }),
      })
    })

    const results = await Promise.all(sendPromises)
    
    // Check if any failed
    const failed = results.filter(res => !res.ok)
    if (failed.length > 0) {
      const err = await failed[0].text()
      console.error('Some emails failed to send:', err)
      throw new Error(`Resend Error: ${err}`)
    }

    return new Response(
      JSON.stringify({ message: `Notifications sent successfully to ${emailList.length} subscribers!` }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
