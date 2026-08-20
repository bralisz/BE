'use strict';

const SUPABASE_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const DEVICE_TOKEN = /^[a-f0-9]{64}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseCookies(req) {
  const out = Object.create(null);
  String(req.headers.cookie || '').split(';').forEach(part => {
    const index = part.indexOf('=');
    if (index < 0) return;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) return;
    try { out[key] = decodeURIComponent(value); }
    catch (_) { out[key] = value; }
  });
  return out;
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
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error('tv_state_failed');
  return Array.isArray(data) ? (data[0] || null) : data;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const cookies = parseCookies(req);
  const sessionId = String(cookies.be_tv_sid || '');
  const deviceToken = String(cookies.be_tv_token || '');
  if (!UUID.test(sessionId) || !DEVICE_TOKEN.test(deviceToken)) {
    return res.status(200).json({ status: 'missing', media_version: -1 });
  }

  try {
    const row = await supabaseRpc('tv_receiver_state', {
      p_session_id: sessionId,
      p_device_token: deviceToken
    });
    return res.status(200).json({
      status: row && row.status ? row.status : 'missing',
      media_version: row && Number.isFinite(Number(row.media_version)) ? Number(row.media_version) : -1
    });
  } catch (error) {
    console.error('TV page state failed:', error);
    return res.status(200).json({ status: 'error', media_version: -1 });
  }
};
