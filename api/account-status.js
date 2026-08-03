'use strict';

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (_) { return {}; }
}

module.exports = async function accountStatusHandler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const supabaseUrl = String(
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://cxkevnnxibhezvospkce.supabase.co'
  ).replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const publishableKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY;
  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!accessToken) return res.status(401).json({ error: 'Sessão não encontrada.' });

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceRoleKey || publishableKey,
        Authorization: `Bearer ${accessToken}`
      }
    });
    const sessionUser = await parseJson(userResponse);
    if (!userResponse.ok || !sessionUser?.id) {
      return res.status(401).json({ error: sessionUser?.msg || sessionUser?.message || 'Sessão inválida.' });
    }

    if (serviceRoleKey) {
      const adminResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(sessionUser.id)}`, {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`
        }
      });
      const account = await parseJson(adminResponse);
      if (adminResponse.ok && account?.id) {
        const banned = Boolean(account.app_metadata?.banned) || (
          account.banned_until && new Date(account.banned_until).getTime() > Date.now()
        );
        if (banned) {
          return res.status(200).json({
            ok: true,
            banned: true,
            bannedAt: account.app_metadata?.banned_at || '',
            reason: account.app_metadata?.ban_reason || ''
          });
        }
      }
    }

    const profileResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(sessionUser.id)}&select=banned,banned_at,ban_reason`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );
    const profiles = await parseJson(profileResponse);
    const profile = Array.isArray(profiles) ? profiles[0] : null;
    return res.status(200).json({
      ok: true,
      banned: Boolean(profile?.banned),
      bannedAt: profile?.banned_at || '',
      reason: profile?.ban_reason || '',
      checkAvailable: true
    });
  } catch (_) {
    return res.status(200).json({ ok: true, banned: false, checkAvailable: false });
  }
};
