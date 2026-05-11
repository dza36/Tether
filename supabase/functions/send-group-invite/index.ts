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
    const record  = payload.record;
    if (!record) {
      return new Response(JSON.stringify({ error: 'No record in payload' }), { status: 400 });
    }

    // Only fire for pending invites
    if (record.status !== 'pending') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const { group_id, user_id, invited_email } = record;
    if (!invited_email) {
      return new Response(JSON.stringify({ error: 'No invited_email on record' }), { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch group name and creator name in parallel
    const { data: group } = await supabaseAdmin
      .from('groups').select('name, created_by').eq('id', group_id).single();

    if (!group) {
      return new Response(JSON.stringify({ error: 'Group not found' }), { status: 400 });
    }

    const { data: creator } = await supabaseAdmin
      .from('users').select('display_name').eq('id', group.created_by).single();

    const creatorName = creator?.display_name?.split(' ')[0] || 'Someone';
    const groupName   = group.name;

    const appUrl    = Deno.env.get('APP_URL')    || 'https://get-tethered.app';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Tether <noreply@get-tethered.app>';
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    let actionUrl = appUrl;
    let subject: string;
    let html: string;

    if (!user_id) {
      // New user — generate Supabase invite link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'invite',
        email: invited_email,
        options: { redirectTo: appUrl },
      });
      if (!linkError) actionUrl = linkData?.properties?.action_link || appUrl;
      subject = `${creatorName} invited you to join ${groupName} on Tether`;
      html = buildNewUserEmail({ creatorName, groupName, actionUrl });
    } else {
      subject = `${creatorName} invited you to join ${groupName} on Tether`;
      html = buildExistingUserEmail({ creatorName, groupName, actionUrl });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromEmail, to: invited_email, subject, html }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.text();
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    const data = await resendRes.json();
    console.log('Email sent:', data.id, 'to', invited_email);
    return new Response(JSON.stringify({ ok: true, emailId: data.id }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('send-group-invite error:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});

// ─── Email templates ──────────────────────────────────────────────────────────

function buildExistingUserEmail({ creatorName, groupName, actionUrl }: {
  creatorName: string; groupName: string; actionUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F4F3FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FF;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#26215C;padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;">tether</div>
          <div style="font-size:13px;color:#AFA9EC;margin-top:4px;">stay connected to what matters</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">You've been invited!</p>
          <p style="margin:0 0 24px;font-size:16px;color:#555;line-height:1.6;">
            <strong>${creatorName}</strong> invited you to join <strong>${groupName}</strong> on Tether.
            Open the app to accept or decline.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#26215C;border-radius:10px;padding:14px 32px;">
              <a href="${actionUrl}" style="color:#fff;font-size:16px;font-weight:600;text-decoration:none;">Open Tether</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#888;text-align:center;">Or visit: <a href="${actionUrl}" style="color:#26215C;">${actionUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">You received this because ${creatorName} invited you to a group on Tether.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildNewUserEmail({ creatorName, groupName, actionUrl }: {
  creatorName: string; groupName: string; actionUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F4F3FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FF;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <tr><td style="background:#26215C;padding:32px 40px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;">tether</div>
          <div style="font-size:13px;color:#AFA9EC;margin-top:4px;">stay connected to what matters</div>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1730;">Join ${groupName} on Tether</p>
          <p style="margin:0 0 16px;font-size:16px;color:#555;line-height:1.6;">
            <strong>${creatorName}</strong> invited you to join <strong>${groupName}</strong> on Tether —
            a shared space for coordinating tasks, events, and the people who matter.
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
            Tap the button below to create your account and accept the invite. This link expires in 24 hours.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
            <tr><td style="background:#26215C;border-radius:10px;padding:14px 32px;">
              <a href="${actionUrl}" style="color:#fff;font-size:16px;font-weight:600;text-decoration:none;">Accept Invite</a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#888;text-align:center;">Or copy: <a href="${actionUrl}" style="color:#26215C;">${actionUrl}</a></p>
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaa;">You received this because ${creatorName} has your email address in Tether. If you don't know this person, you can ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
