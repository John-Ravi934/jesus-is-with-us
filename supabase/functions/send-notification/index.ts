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
<div style="font-family: 'Inter', Arial, sans-serif; background-color: #0b0510; background-image: radial-gradient(circle at 0% 30%, rgba(200, 0, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 100% 70%, rgba(255, 100, 0, 0.2) 0%, transparent 50%); padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 650px; margin: 0 auto;">
    
    <!-- Top Bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
      <tr>
        <td style="font-size: 11px; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          <span style="vertical-align: middle;">🕊️ JESUS IS WITH US MINISTRIES</span>
        </td>
        <td align="right" style="font-size: 11px; color: #cbd5e1; text-decoration: underline;">
          <a href="#" style="color: #cbd5e1;">View in browser</a>
        </td>
      </tr>
    </table>

    <!-- Header Section -->
    <div style="margin-bottom: 30px;">
      <h1 style="font-size: 32px; margin: 0 0 10px 0; line-height: 1.3; font-weight: 800;">
        ${record.title}
      </h1>
    </div>

    <!-- Date Badge -->
    <div style="text-align: center; margin-bottom: 30px;">
      <span style="display: inline-block; padding: 10px 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; font-size: 15px; font-weight: 600; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
        <span style="color: #e80980;">📅 DATE:</span> ${record.event_date ? new Date(record.event_date).toLocaleDateString('en-GB') : 'TBA'}
      </span>
    </div>

    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 25px; text-align: center; box-shadow: 0 0 40px rgba(200, 0, 255, 0.15), inset 0 0 20px rgba(255,255,255,0.05); position: relative; margin-bottom: 30px;">
      <div style="position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);"></div>

      ${record.image_url ? `<img src="${record.image_url}" alt="Poster" style="width: 100%; height: auto; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />` : ''}
      
      <p style="font-size: 16px; margin-bottom: 30px; color: #f8f8fa; font-weight: 500; line-height: 1.5;">${cleanDesc}</p>
      
      ${record.learn_more_url ? `<a href="${record.learn_more_url}" style="display: inline-block; padding: 16px 45px; background: linear-gradient(90deg, #e80980 0%, #ff9a44 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 8px 25px rgba(232, 9, 128, 0.4);">Learn More</a>` : ''}
    </div>

    <!-- Footer Card -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 35px 25px; text-align: center; box-shadow: 0 0 40px rgba(0, 150, 255, 0.1), inset 0 0 20px rgba(255,255,255,0.05); position: relative;">
      <div style="position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);"></div>

      <h3 style="font-size: 24px; margin: 0 0 8px 0; font-weight: 700;">Stay Connected With Us</h3>
      <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 25px 0;">Let's continue to pray, grow, and serve together.</p>
      
      <!-- Social Icons -->
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto 35px auto;">
        <tr>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/color/96/000000/facebook-new.png" width="44" alt="Facebook" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(59,89,152,0.4);" /></a>
          </td>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/fluency/96/000000/instagram-new.png" width="44" alt="Instagram" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(220,39,67,0.4);" /></a>
          </td>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/color/96/000000/youtube-play.png" width="44" alt="YouTube" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(255,0,0,0.4);" /></a>
          </td>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/color/96/000000/whatsapp--v1.png" width="44" alt="WhatsApp" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(37,211,102,0.4);" /></a>
          </td>
        </tr>
      </table>

      <!-- Contact Info -->
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px; text-align: center;">
         <div style="background: linear-gradient(135deg, #ffffff, #e2e8f0); border-radius: 50%; width: 60px; height: 60px; line-height: 60px; display: inline-block; border: 2px solid #e80980; box-shadow: 0 0 15px rgba(232,9,128,0.3); margin-bottom: 15px;">
            <span style="font-size: 30px; vertical-align: middle;">🙏</span>
         </div>
         
         <div style="color: #ffec1f; font-size: 18px; font-weight: bold; margin-bottom: 15px;">Jesus Is With Us Ministries</div>
         
         <div style="font-size: 14px; color: #f8f8fa; line-height: 2; word-break: break-word;">
            <div style="margin-bottom: 8px;"><span style="color: #e80980; font-size: 16px; margin-right: 6px;">📍</span> இயேசு நம்மோடு இருக்கிறார் ஊழியங்கள்,<br/>சேலம் - 636030</div>
            <div style="margin-bottom: 8px;"><span style="color: #e80980; font-size: 16px; margin-right: 6px;">📞</span> ஜெப உதவிக்கு: 0427-2382872</div>
            <div><span style="color: #e80980; font-size: 16px; margin-right: 6px;">✉️</span> jesuswithusministries@gmail.com</div>
         </div>
      </div>

      <!-- Copyright -->
      <div style="font-size: 12px; color: #94a3b8; margin-top: 25px; line-height: 1.6;">
        &copy; 2026 Jesus Is With Us Ministries. All rights reserved.<br/>
        You are receiving this email because you are part of our ministry family.
      </div>
    </div>
  </div>
</div>
      `
    } else if (table === 'rhema_words') {
      // It's a new Rhema Word
      emailSubject = `Today's Rhema Word: ${record.title}`
      
      htmlBody = `
<div style="font-family: 'Inter', Arial, sans-serif; background-color: #0b0510; background-image: radial-gradient(circle at 0% 30%, rgba(200, 0, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 100% 70%, rgba(255, 100, 0, 0.2) 0%, transparent 50%); padding: 40px 20px; color: #ffffff;">
  <div style="max-width: 650px; margin: 0 auto;">
    
    <!-- Top Bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
      <tr>
        <td style="font-size: 11px; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          <span style="vertical-align: middle;">🕊️ JESUS IS WITH US MINISTRIES</span>
        </td>
        <td align="right" style="font-size: 11px; color: #cbd5e1; text-decoration: underline;">
          <a href="#" style="color: #cbd5e1;">View in browser</a>
        </td>
      </tr>
    </table>

    <!-- Header Section -->
    <div style="margin-bottom: 30px; text-align: center;">
      <h2 style="color: #ffec1f; font-family: 'Great Vibes', cursive, Arial, sans-serif; font-size: 28px; font-weight: normal; margin: 0 0 10px 0;">Today's Rhema Word</h2>
      <h1 style="font-size: 32px; margin: 0; line-height: 1.3; font-weight: 800;">
        ${record.title}
      </h1>
    </div>

    <!-- Main Card -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 25px; text-align: center; box-shadow: 0 0 40px rgba(200, 0, 255, 0.15), inset 0 0 20px rgba(255,255,255,0.05); position: relative; margin-bottom: 30px;">
      <div style="position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);"></div>

      <p style="color: #e80980; font-size: 15px; font-weight: bold; letter-spacing: 1px; margin-bottom: 20px; text-transform: uppercase;">${record.scripture_reference || ''}</p>
      
      ${record.image_url ? `<img src="${record.image_url}" alt="Rhema" style="width: 100%; height: auto; border-radius: 16px; margin-bottom: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />` : ''}
      
      <p style="font-size: 16px; margin-bottom: 0; color: #f8f8fa; font-weight: 500; text-align: left; line-height: 1.6;">${record.content || ''}</p>
    </div>

    <!-- Footer Card -->
    <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 35px 25px; text-align: center; box-shadow: 0 0 40px rgba(0, 150, 255, 0.1), inset 0 0 20px rgba(255,255,255,0.05); position: relative;">
      <div style="position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);"></div>

      <h3 style="font-size: 24px; margin: 0 0 8px 0; font-weight: 700;">Stay Connected With Us</h3>
      <p style="color: #cbd5e1; font-size: 15px; margin: 0 0 25px 0;">Let's continue to pray, grow, and serve together.</p>
      
      <!-- Social Icons -->
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto 35px auto;">
        <tr>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/color/96/000000/facebook-new.png" width="44" alt="Facebook" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(59,89,152,0.4);" /></a>
          </td>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/fluency/96/000000/instagram-new.png" width="44" alt="Instagram" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(220,39,67,0.4);" /></a>
          </td>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/color/96/000000/youtube-play.png" width="44" alt="YouTube" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(255,0,0,0.4);" /></a>
          </td>
          <td style="padding: 0 10px;">
            <a href="#"><img src="https://img.icons8.com/color/96/000000/whatsapp--v1.png" width="44" alt="WhatsApp" style="display: block; border-radius: 50%; box-shadow: 0 4px 15px rgba(37,211,102,0.4);" /></a>
          </td>
        </tr>
      </table>

      <!-- Contact Info -->
      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 30px; text-align: center;">
         <div style="background: linear-gradient(135deg, #ffffff, #e2e8f0); border-radius: 50%; width: 60px; height: 60px; line-height: 60px; display: inline-block; border: 2px solid #e80980; box-shadow: 0 0 15px rgba(232,9,128,0.3); margin-bottom: 15px;">
            <span style="font-size: 30px; vertical-align: middle;">🙏</span>
         </div>
         
         <div style="color: #ffec1f; font-size: 18px; font-weight: bold; margin-bottom: 15px;">Jesus Is With Us Ministries</div>
         
         <div style="font-size: 14px; color: #f8f8fa; line-height: 2; word-break: break-word;">
            <div style="margin-bottom: 8px;"><span style="color: #e80980; font-size: 16px; margin-right: 6px;">📍</span> இயேசு நம்மோடு இருக்கிறார் ஊழியங்கள்,<br/>சேலம் - 636030</div>
            <div style="margin-bottom: 8px;"><span style="color: #e80980; font-size: 16px; margin-right: 6px;">📞</span> ஜெப உதவிக்கு: 0427-2382872</div>
            <div><span style="color: #e80980; font-size: 16px; margin-right: 6px;">✉️</span> jesuswithusministries@gmail.com</div>
         </div>
      </div>

      <!-- Copyright -->
      <div style="font-size: 12px; color: #94a3b8; margin-top: 25px; line-height: 1.6;">
        &copy; 2026 Jesus Is With Us Ministries. All rights reserved.<br/>
        You are receiving this email because you are part of our ministry family.
      </div>
    </div>
  </div>
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
