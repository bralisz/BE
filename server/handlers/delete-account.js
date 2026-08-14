'use strict';

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

function getConfig() {
  return {
    url: String(
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://cxkevnnxibhezvospkce.supabase.co'
    ).replace(/\/$/, ''),
    publishableKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      DEFAULT_PUBLISHABLE_KEY,
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SB_SERVICE_ROLE_KEY ||
      ''
  };
}

function serviceHeaders(serviceKey, extra = {}) {
  const headers = { apikey: serviceKey, ...extra };
  if (!/^sb_secret_/i.test(String(serviceKey || ''))) {
    headers.Authorization = `Bearer ${serviceKey}`;
  }
  return headers;
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) { return { message: text }; }
}

function errorMessage(payload, fallback) {
  return payload?.msg || payload?.message || payload?.error_description || payload?.error || fallback;
}

function validRequestOrigin(req) {
  const origin = String(req.headers.origin || '');
  const host = String(req.headers.host || '');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch (_) { return false; }
}

async function getAuthenticatedUser(url, publishableKey, accessToken) {
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  return { response, payload: await readJson(response) };
}

async function deleteWithServiceRole(url, serviceRoleKey, userId) {
  const response = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
    headers: serviceHeaders(serviceRoleKey, { 'Content-Type': 'application/json' })
  });
  const payload = await readJson(response);
  if (!response.ok) {
    const error = new Error(errorMessage(payload, 'Não foi possível excluir a conta no Supabase.'));
    error.status = response.status;
    throw error;
  }

  try {
    await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: serviceHeaders(serviceRoleKey, { Prefer: 'return=minimal' })
    });
  } catch (_) {}
}


async function accountStatusHandler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { url, publishableKey, serviceRoleKey } = getConfig();
  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!accessToken) {
    return res.status(200).json({ ok: true, authenticated: false, banned: false, reason: '', bannedAt: '' });
  }

  try {
    const { response: userResponse, payload: sessionUser } = await getAuthenticatedUser(url, publishableKey, accessToken);
    if (!userResponse.ok || !sessionUser?.id) {
      const authCode = String(sessionUser?.code || sessionUser?.error_code || '').toLowerCase();
      const authMessage = String(sessionUser?.msg || sessionUser?.message || '').toLowerCase();
      const isBanned = authCode === 'user_banned' || authMessage.includes('banned');
      if (isBanned) {
        return res.status(200).json({ ok: true, authenticated: true, banned: true, reason: '', bannedAt: '' });
      }
      return res.status(200).json({ ok: true, authenticated: false, banned: false, reason: '', bannedAt: '' });
    }

    if (serviceRoleKey) {
      const adminResponse = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(sessionUser.id)}`, {
        headers: serviceHeaders(serviceRoleKey)
      });
      const account = await readJson(adminResponse);
      if (adminResponse.ok && account?.id) {
        const banned = Boolean(account.app_metadata?.banned) || (
          account.banned_until && new Date(account.banned_until).getTime() > Date.now()
        );
        if (banned) {
          return res.status(200).json({
            ok: true,
            authenticated: true,
            banned: true,
            bannedAt: account.app_metadata?.banned_at || '',
            reason: account.app_metadata?.ban_reason || ''
          });
        }
      }
    }

    const profileResponse = await fetch(
      `${url}/rest/v1/profiles?id=eq.${encodeURIComponent(sessionUser.id)}&select=*`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );
    const profiles = await readJson(profileResponse);
    const profile = profileResponse.ok && Array.isArray(profiles) ? profiles[0] : null;
    return res.status(200).json({
      ok: true,
      authenticated: true,
      banned: Boolean(profile?.banned),
      bannedAt: profile?.banned_at || '',
      reason: profile?.ban_reason || '',
      checkAvailable: profileResponse.ok
    });
  } catch (_) {
    return res.status(200).json({ ok: true, authenticated: null, banned: false, checkAvailable: false });
  }
}

module.exports = async function deleteAccountHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (String(req.query?.action || '') === 'status') {
    return accountStatusHandler(req, res);
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!validRequestOrigin(req)) return res.status(403).json({ error: 'Origem da solicitação não permitida.' });

  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!accessToken) return res.status(401).json({ error: 'Sessão não encontrada.' });

  const { url, publishableKey, serviceRoleKey } = getConfig();

  try {
    const { response: userResponse, payload: user } = await getAuthenticatedUser(url, publishableKey, accessToken);
    if (!userResponse.ok || !user?.id) {
      return res.status(401).json({ error: errorMessage(user, 'Sessão inválida ou expirada.') });
    }

    if (!serviceRoleKey) {
      return res.status(503).json({
        error: 'A exclusão permanente precisa da chave secreta do Supabase no servidor. Configure SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY na Vercel.'
      });
    }

    // Exclusão própria é sempre permanente: não altera ban_duration nem marca
    // o perfil como banido. O usuário é removido diretamente do Supabase Auth.
    await deleteWithServiceRole(url, serviceRoleKey, user.id);

    return res.status(200).json({ ok: true, deleted: true, banned: false, userId: user.id });
  } catch (error) {
    const status = Number(error?.status) >= 400 && Number(error?.status) < 600 ? Number(error.status) : 500;
    return res.status(status).json({ error: error?.message || 'Falha interna ao excluir a conta.' });
  }
};
