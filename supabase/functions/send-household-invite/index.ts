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

    // Database Webhook sends { type, table, record, old_record }
    const record = payload.record;
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 });
    }

    const { household_id, invited_by, invited_email, invited_user_id } = record;

    // Admin client — can read any row + generate invite links
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch household name and inviter display name in parallel
    const [householdRes, inviterRes] = await Promise.all([
      supabaseAdmin.from('households').select('name').eq('id', household_id).single(),
      supabaseAdmin.from('users').select('display_name, email').eq('id', invited_by).single(),
    ]);

    const householdName = householdRes.data?.name || 'a household';
    const inviterRaw = inviterRes.data?.display_name || inviterRes.data?.email?.split('@')[0] || 'Someone';
    // Capitalise first name only for friendliness
    const inviterName = inviterRaw.split(' ')[0];

    const appUrl = Deno.env.get('APP_URL') || 'https://tether.app';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Tether <hello@tether.app>';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    let actionUrl = appUrl;
    let subject: string;
    let html: string;

    if (!invited_user_id) {
      // New user — generate a Supabase invite link so they land authenticated
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: invited_email,
        options: { redirectTo: appUrl },
      });

      if (linkError) {
        console.error('generateLink error:', linkError);
        // Fall back to app URL — they'll still get the email, just won't be pre-authed
        actionUrl = appUrl;
      } else {
        actionUrl = linkData?.properties?.action_link || appUrl;
      }

      subject = `${inviterName} invited you to join ${householdName} on Tether`;
      html = buildNewUserEmail({ inviterName, householdName, actionUrl });
    } else {
      // Existing user — just open the app; the in-app banner will show the invite
      subject = `${inviterName} invited you to ${householdName} on Tether`;
      html = buildExistingUserEmail({ inviterName, householdName, actionUrl });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: invited_email,
        subject,
        html,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error('Resend error:', errText);
      return new Response(JSON.stringify({ error: errText }), { status: 500 });
    }

    const resendData = await resendRes.json();
    console.log('Email sent:', resendData.id, 'to', invited_email);

    return new Response(JSON.stringify({ ok: true, emailId: resendData.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('send-household-invite error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});

// ─── Email templates ──────────────────────────────────────────────────────────

interface EmailParams {
  inviterName: string;
  householdName: string;
  actionUrl: string;
}

function buildExistingUserEmail({ inviterName, householdName, actionUrl }: EmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>You're invited to ${householdName}</title>
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
            <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">You've been invited!</p>
            <p style="margin:0 0 24px;font-size:16px;color:#555;line-height:1.6;">
              <strong>${inviterName}</strong> invited you to join <strong>${householdName}</strong> on Tether.
              Open the app to accept or decline.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#26215C;border-radius:10px;padding:14px 32px;">
                  <a href="${actionUrl}" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Open Tether</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#888;text-align:center;">
              Or copy this link: <a href="${actionUrl}" style="color:#26215C;">${actionUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              You received this because ${inviterName} has your email address in Tether.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildNewUserEmail({ inviterName, householdName, actionUrl }: EmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Join ${householdName} on Tether</title>
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
            <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">You're invited to Tether</p>
            <p style="margin:0 0 24px;font-size:16px;color:#555;line-height:1.6;">
              <strong>${inviterName}</strong> invited you to join <strong>${householdName}</strong> on Tether —
              a shared space for tasks, events, and keeping everyone on the same page.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
              Tap the button below to create your account and accept the invite. This link expires in 24 hours.
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
              <tr>
                <td style="background:#26215C;border-radius:10px;padding:14px 32px;">
                  <a href="${actionUrl}" style="color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">Accept Invite</a>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:13px;color:#888;text-align:center;">
              Or copy this link: <a href="${actionUrl}" style="color:#26215C;">${actionUrl}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">
              You received this because ${inviterName} has your email address in Tether.
              If you don't want to join, you can ignore this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
