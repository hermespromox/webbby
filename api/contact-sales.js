const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const volume = String(body.volume || '').trim();
    const message = String(body.message || '').trim();
    const lang = String(body.lang || 'en').trim();

    if (!email || !EMAIL_RE.test(email)) {
      return sendJson(res, 400, { ok: false, error: 'Valid email required' });
    }
    if (!message) {
      return sendJson(res, 400, { ok: false, error: 'Message required' });
    }

    if (!process.env.RESEND_API_KEY) {
      return sendJson(res, 500, { ok: false, error: 'RESEND_API_KEY is not configured' });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #140400;">
        <div style="background:#FF4801; padding: 26px; border-radius: 18px; color:white;">
          <h1 style="margin:0;font-size:26px;">Webbby — Contact sales</h1>
          <p style="margin:8px 0 0;color:#fff3eb;">Nouvelle demande volume / sales</p>
        </div>
        <div style="padding:24px 0;">
          <h2 style="margin-top:0;">Nouvelle demande Webbby</h2>
          <div style="background:#FFFBF5;border:1px solid #EBD5C1;padding:18px;border-radius:14px;line-height:1.7;">
            <p style="margin:0;">
              <strong>Email :</strong> ${escapeHtml(email)}<br/>
              ${name ? `<strong>Nom / société :</strong> ${escapeHtml(name)}<br/>` : ''}
              ${volume ? `<strong>Volume :</strong> ${escapeHtml(volume)}<br/>` : ''}
              <strong>Langue :</strong> ${escapeHtml(lang)}<br/>
              <strong>Message :</strong><br/>${escapeHtml(message).replaceAll('\n', '<br/>')}<br/><br/>
              <strong>Date :</strong> ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
            </p>
          </div>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.WEBBBY_FROM || 'Webbby <onboarding@resend.dev>',
        to: [process.env.WEBBBY_CONTACT_TO || 'hermes.promox@gmail.com'],
        subject: `Webbby — contact sales — ${email}`,
        reply_to: email,
        html
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend error', response.status, data);
      return sendJson(res, 502, { ok: false, error: 'Email provider error' });
    }

    return sendJson(res, 200, { ok: true, id: data.id || null });
  } catch (error) {
    console.error('contact-sales error', error);
    return sendJson(res, 500, { ok: false, error: 'Unexpected error' });
  }
};
