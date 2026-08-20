'use strict';

const SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const DEVICE_TOKEN = /^[a-f0-9]{64}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(String(req.body || '{}')); }
  catch (_) { return {}; }
}

async function supabaseRpc(name, payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload || {})
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; }
  catch (_) { data = null; }

  if (!response.ok) {
    const message = data?.message || data?.error_description || data?.hint || 'tv_rpc_failed';
    const error = new Error(String(message));
    error.status = response.status;
    throw error;
  }
  return Array.isArray(data) ? (data[0] || null) : data;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const action = String(req.query?.action || '').trim().toLowerCase();
  const body = parseBody(req);

  try {
    if (action === 'create') {
      const deviceToken = String(body.deviceToken || '').trim();
      if (!DEVICE_TOKEN.test(deviceToken)) return res.status(400).json({ error: 'invalid_device_token' });
      const row = await supabaseRpc('tv_create_session', { p_device_token: deviceToken });
      return res.status(200).json(row || null);
    }

    if (action === 'state') {
      const sessionId = String(body.sessionId || '').trim();
      const deviceToken = String(body.deviceToken || '').trim();
      if (!UUID.test(sessionId) || !DEVICE_TOKEN.test(deviceToken)) return res.status(400).json({ error: 'invalid_session' });
      const row = await supabaseRpc('tv_receiver_state', {
        p_session_id: sessionId,
        p_device_token: deviceToken
      });
      return res.status(200).json(row || null);
    }

    return res.status(400).json({ error: 'invalid_action' });
  } catch (error) {
    console.error('TV receiver bridge failed:', error);
    return res.status(Number(error?.status) || 502).json({
      error: 'tv_bridge_failed',
      message: String(error?.message || 'tv_bridge_failed')
    });
  }
};
