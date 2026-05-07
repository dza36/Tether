import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RSVP_PHRASE: Record<string, string> = {
  going:     'is going to',
  not_going: "can't make it to",
  maybe:     'is tentatively going to',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record     = payload.record;
    const oldRecord  = payload.old_record;
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 });
    }

    // Skip owners and pending/unchanged status
    if (record.is_owner) {
      return new Response(JSON.stringify({ skipped: 'owner' }), { status: 200 });
    }
    if (!record.rsvp_status || record.rsvp_status === 'pending') {
      return new Response(JSON.stringify({ skipped: 'pending' }), { status: 200 });
    }
    if (oldRecord?.rsvp_status === record.rsvp_status) {
      return new Response(JSON.stringify({ skipped: 'unchanged' }), { status: 200 });
    }

    const { item_id, user_id, rsvp_status } = record;
    const phrase = RSVP_PHRASE[rsvp_status] || 'updated their RSVP for';

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const [eventRes, guestRes] = await Promise.all([
      supabaseAdmin.from('items').select('name, event_date, created_by').eq('id', item_id).single(),
      supabaseAdmin.from('users').select('display_name').eq('id', user_id).single(),
    ]);

    const event     = eventRes.data;
    const guestName = guestRes.data?.display_name || 'Someone';

    if (!event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 400 });
    }

    // Don't notify if the RSVPer is the event owner
    if (event.created_by === user_id) {
      return new Response(JSON.stringify({ skipped: 'self-rsvp' }), { status: 200 });
    }

    const { data: ownerData } = await supabaseAdmin
      .from('users').select('email').eq('id', event.created_by).single();

    if (!ownerData?.email) {
      return new Response(JSON.stringify({ error: 'Owner email not found' }), { status: 400 });
    }

    const appUrl    = Deno.env.get('APP_URL')    || 'https://get-tethered.app';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Tether <noreply@get-tethered.app>';
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    const subject = `${guestName.split(' ')[0]} ${phrase} ${event.name}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: ownerData.email,
        subject,
        html: buildEmail({ guestName, phrase, eventName: event.name, appUrl }),
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await resendRes.json();
    console.log('Email sent:', data.id, 'to', ownerData.email);
    return new Response(JSON.stringify({ ok: true, emailId: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('send-rsvp-update error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});

function buildEmail({ guestName, phrase, eventName, appUrl }: {
  guestName: string; phrase: string; eventName: string; appUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F4F3FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FF;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#26215C;padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">tether</div>
          <div style="font-size:13px;color:#AFA9EC;margin-top:4px;">stay connected to what matters</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">RSVP update</p>
          <p style="margin:0 0 24px;font-size:16px;color:#555;line-height:1.6;">
            <strong>${guestName}</strong> ${phrase} <strong>${eventName}</strong>.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#26215C;border-radius:10px;padding:14px 32px;">
              <a href="${appUrl}" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">View Event</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#888;text-align:center;">Or visit: <a href="${appUrl}" style="color:#26215C;">${appUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">You received this because you own this event on Tether.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
