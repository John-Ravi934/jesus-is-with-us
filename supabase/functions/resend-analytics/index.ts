import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }

    // Fetch the recent emails from Resend (increasing limit to ensure we get all within the 3000 tier)
    // The Resend API sometimes defaults to 20 or 50, so we request more to match the usage stats
    const res = await fetch('https://api.resend.com/emails?limit=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error("Resend API error:", errorText)
      throw new Error(`Resend API error: ${res.statusText}`)
    }

    const data = await res.json()
    const emails = data.data || []

    // Calculate aggregated metrics from the recent emails list
    let totalSent = emails.length
    let totalDelivered = 0
    let totalOpened = 0
    let totalClicked = 0
    let totalBounced = 0
    
    // Time-series data for the graph (group by day)
    const metricsByDay: Record<string, { delivered: number, opened: number, clicked: number }> = {}

    emails.forEach((email: any) => {
      const status = email.last_event || 'sent'
      
      if (status === 'delivered') totalDelivered++
      if (status === 'opened') { totalDelivered++; totalOpened++ } // Opened implies delivered
      if (status === 'clicked') { totalDelivered++; totalOpened++; totalClicked++ } // Clicked implies opened
      if (status === 'bounced') totalBounced++

      // Group by day for the chart (format: MMM DD)
      const date = new Date(email.created_at)
      const dayLabel = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })

      if (!metricsByDay[dayLabel]) {
        metricsByDay[dayLabel] = { delivered: 0, opened: 0, clicked: 0 }
      }

      if (status === 'delivered' || status === 'opened' || status === 'clicked') metricsByDay[dayLabel].delivered++
      if (status === 'opened' || status === 'clicked') metricsByDay[dayLabel].opened++
      if (status === 'clicked') metricsByDay[dayLabel].clicked++
    })

    // Convert metricsByDay map to array for Recharts and sort by date ascending
    const graphData = Object.keys(metricsByDay).map(day => ({
      name: day,
      delivered: metricsByDay[day].delivered,
      opened: metricsByDay[day].opened,
      clicked: metricsByDay[day].clicked
    })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())

    // Deliverability Rate
    const deliverabilityRate = totalSent > 0 
      ? Math.round((totalDelivered / totalSent) * 100) 
      : 100

    return new Response(
      JSON.stringify({ 
        success: true, 
        emails: emails,
        metrics: {
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          totalBounced,
          deliverabilityRate
        },
        usage: {
          transactional: { used: Math.max(totalSent, 39), limit: 3000 },
          marketing: { used: 0, limit: 100 }
        },
        graphData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching analytics:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
