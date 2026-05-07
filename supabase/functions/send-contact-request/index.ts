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

    // Database webhook sends { type, table, record, old_record }
    const record = payload.record;
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 });
    }

    const { requester_id, recipient_id, status } = record;
    if (status !== 'pending') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch requester profile and recipient email in parallel
    const [requesterRes, recipientRes] = await Promise.all([
      supabaseAdmin.from('users').select('display_name, email').eq('id', requester_id).single(),
      supabaseAdmin.from('users').select('email').eq('id', recipient_id).single(),
    ]);

    const requesterName = requesterRes.data?.display_name
      || requesterRes.data?.email?.split('@')[0]
      || 'Someone';
    const recipientEmail = recipientRes.data?.email;

    if (!recipientEmail) {
      console.error('No recipient email found for', recipient_id);
      return new Response(JSON.stringify({ error: 'Recipient email not found' }), { status: 400 });
    }

    const appUrl    = Deno.env.get('APP_URL')      || 'https://get-tethered.app';
    const fromEmail = Deno.env.get('FROM_EMAIL')   || 'Tether <noreply@get-tethered.app>';
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!resendKey) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    const firstName = requesterName.split(' ')[0];
    const subject   = `${firstName} sent you a contact request on Tether`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipientEmail,
        subject,
        html: buildEmail({ requesterName, appUrl }),
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', errText);
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const resendData = await resendRes.json();
    console.log('Email sent:', resendData.id, 'to', recipientEmail);

    return new Response(JSON.stringify({ ok: true, emailId: resendData.id }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('send-contact-request error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});

// ─── Email template ───────────────────────────────────────────────────────────

function buildEmail({ requesterName, appUrl }: { requesterName: string; appUrl: string }): string {
  const firstName = requesterName.split(' ')[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Contact request from ${requesterName}</title>
</head>
<body style="margin:0;padding:0;background:#F4F3FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FF;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#26215C;padding:32px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">tether</div>
            <div style="font-size:13px;color:#AFA9EC;margin-top:4px;">stay connected to what matters</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">You have a contact request</p>
            <p style="margin:0 0 24px;font-size:16px;color:#555;line-height:1.6;">
              <strong>${requesterName}</strong> wants to connect with you on Tether.
              Open the app to accept or decline.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#26215C;border-radius:10px;padding:14px 32px;">
                  <a href="${appUrl}" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Open Tether</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#888;text-align:center;">
              Or copy this link: <a href="${appUrl}" style="color:#26215C;">${appUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              You received this because ${firstName} has your email address in Tether.
              If you don't know this person, you can decline the request in the app.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
