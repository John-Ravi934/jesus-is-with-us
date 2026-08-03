import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Your secure environment variables
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'your-personal-email@gmail.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS preflight requests from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Get the form data from the frontend
    const { fullName, email, phone, interest, message, formType, subject, place } = await req.json()

    const emailSubject = formType ? `New ${formType} from ${fullName}` : `New Request from ${fullName}`

    // 3. Send the email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Acme <onboarding@resend.dev>', 
        to: [ADMIN_EMAIL],
        subject: emailSubject,
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #090b24; color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid rgba(255,255,255,0.1);">
            <div style="background: linear-gradient(135deg, #e33b70 0%, #f59e0b 100%); padding: 30px 20px; text-align: center;">
              <h2 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">Jesus Is With Us</h2>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 600;">${emailSubject}</p>
            </div>
            
            <div style="padding: 35px; background-color: #0f1235;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: separate; border-spacing: 0 15px;">
                <tr>
                  <td width="30%" style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Name</td>
                  <td width="70%" style="color: #ffffff; font-size: 16px; font-weight: 500;">${fullName}</td>
                </tr>
                <tr>
                  <td style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Email</td>
                  <td style="color: #ffffff; font-size: 16px;"><a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a></td>
                </tr>
                ${phone ? `
                <tr>
                  <td style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Phone</td>
                  <td style="color: #ffffff; font-size: 16px;">${phone}</td>
                </tr>
                ` : ''}
                ${subject ? `
                <tr>
                  <td style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Subject</td>
                  <td style="color: #ffffff; font-size: 16px;">${subject}</td>
                </tr>
                ` : ''}
                ${place ? `
                <tr>
                  <td style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Place</td>
                  <td style="color: #ffffff; font-size: 16px;">${place}</td>
                </tr>
                ` : ''}
                ${interest ? `
                <tr>
                  <td style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top;">Interest</td>
                  <td style="color: #ffffff; font-size: 16px;">${interest}</td>
                </tr>
                ` : ''}
              </table>
              
              <div style="margin-top: 25px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.05);">
                <div style="color: #f59e0b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px;">Message</div>
                <div style="background-color: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; border-left: 4px solid #e33b70; color: #e2e8f0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message || 'No message provided'}</div>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; background-color: #090b24; color: #64748b; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0;">This email was sent securely from your website's contact form.</p>
            </div>
          </div>
        `,
      }),
    })

    const data = await res.json()

    // 4. Return success to the frontend
    if (res.ok) {
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } else {
      return new Response(JSON.stringify({ error: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
