import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record;
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 });
    }

    // Skip owner — they created the event, no invite needed
    if (record.is_owner) {
      return new Response(JSON.stringify({ skipped: 'owner' }), { status: 200 });
    }

    const { item_id, user_id } = record;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const [eventRes, inviteeRes] = await Promise.all([
      supabaseAdmin.from('items').select('name, event_date, start_time, location, created_by').eq('id', item_id).single(),
      supabaseAdmin.from('users').select('email, display_name').eq('id', user_id).single(),
    ]);

    const event    = eventRes.data;
    const invitee  = inviteeRes.data;

    if (!event || !invitee?.email) {
      console.error('Missing event or invitee', { event, invitee });
      return new Response(JSON.stringify({ error: 'Missing event or invitee data' }), { status: 400 });
    }

    const { data: ownerData } = await supabaseAdmin
      .from('users').select('display_name').eq('id', event.created_by).single();

    const ownerName  = ownerData?.display_name?.split(' ')[0] || 'Someone';
    const appUrl     = Deno.env.get('APP_URL')    || 'https://get-tethered.app';
    const fromEmail  = Deno.env.get('FROM_EMAIL') || 'Tether <noreply@get-tethered.app>';
    const resendKey  = Deno.env.get('RESEND_API_KEY');

    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    const subject = `${ownerName} invited you to ${event.name}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromEmail,
        to: invitee.email,
        subject,
        html: buildEmail({ ownerName, event, appUrl }),
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await resendRes.json();
    console.log('Email sent:', data.id, 'to', invitee.email);
    return new Response(JSON.stringify({ ok: true, emailId: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('send-event-invite error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function buildEmail({ ownerName, event, appUrl }: { ownerName: string; event: any; appUrl: string }): string {
  const dateLine = event.event_date ? `<p style="margin:0 0 8px;font-size:14px;color:#888;">📅 ${formatDate(event.event_date)}${event.start_time ? ' at ' + event.start_time : ''}</p>` : '';
  const locLine  = event.location   ? `<p style="margin:0 0 24px;font-size:14px;color:#888;">📍 ${event.location}</p>` : '<div style="margin-bottom:24px"></div>';
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
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">You're invited!</p>
          <p style="margin:0 0 16px;font-size:16px;color:#555;line-height:1.6;"><strong>${ownerName}</strong> invited you to <strong>${event.name}</strong>.</p>
          ${dateLine}
          ${locLine}
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#26215C;border-radius:10px;padding:14px 32px;">
              <a href="${appUrl}" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Open Tether to RSVP</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#888;text-align:center;">Or visit: <a href="${appUrl}" style="color:#26215C;">${appUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">You received this because ${ownerName} invited you to an event on Tether.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
