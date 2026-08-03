'use strict';

const ADMIN_EMAIL = 'bralisofc@gmail.com';

function envConfig() {
  return {
    url: String(
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://cxkevnnxibhezvospkce.supabase.co'
    ).replace(/\/$/, ''),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  };
}

async function jsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (_) { return { message: text }; }
}

async function getUserByToken(url, serviceKey, accessToken) {
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  const body = await jsonResponse(response);
  if (!response.ok || !body?.id) {
    const error = new Error(body?.msg || body?.message || 'Sessão inválida ou expirada.');
    error.status = 401;
    throw error;
  }
  return body;
}

async function getAdminUser(url, serviceKey, userId) {
  const response = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`
    }
  });
  const body = await jsonResponse(response);
  if (!response.ok || !body?.id) {
    const error = new Error(body?.msg || body?.message || 'Usuário não encontrado.');
    error.status = response.status || 404;
    throw error;
  }
  return body;
}

async function getProfile(url, serviceKey, userId) {
  const response = await fetch(
    `${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: 'application/json'
      }
    }
  );
  const body = await jsonResponse(response);
  if (!response.ok) return null;
  return Array.isArray(body) ? body[0] || null : null;
}

async function patchProfile(url, serviceKey, userId, patch) {
  const response = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(patch)
  });
  if (!response.ok) {
    const body = await jsonResponse(response);
    return body?.message || body?.error || 'Não foi possível atualizar o perfil.';
  }
  return '';
}

module.exports = async function adminUserHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { url, serviceKey } = envConfig();
  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const action = String(req.body?.action || '').trim().toLowerCase();
  const userId = String(req.body?.userId || '').trim();
  const reason = String(req.body?.reason || '').trim().slice(0, 500);

  if (!serviceKey) {
    return res.status(503).json({
      error: 'Configure SUPABASE_SERVICE_ROLE_KEY nas variáveis do projeto Vercel para gerenciar usuários.'
    });
  }
  if (!accessToken) return res.status(401).json({ error: 'Sessão administrativa não encontrada.' });
  if (!userId) return res.status(400).json({ error: 'Usuário não informado.' });
  if (!['delete', 'ban', 'unban', 'export'].includes(action)) {
    return res.status(400).json({ error: 'Ação inválida.' });
  }

  try {
    const requester = await getUserByToken(url, serviceKey, accessToken);
    if (String(requester.email || '').toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Apenas o administrador pode realizar esta ação.' });
    }

    const target = await getAdminUser(url, serviceKey, userId);
    if (String(target.email || '').toLowerCase() === ADMIN_EMAIL || target.id === requester.id) {
      return res.status(403).json({ error: 'A conta administrativa principal não pode ser alterada aqui.' });
    }

    if (action === 'export') {
      const profile = await getProfile(url, serviceKey, userId);
      const identities = Array.isArray(target.identities)
        ? target.identities.map(identity => ({
            id: identity.id,
            provider: identity.provider,
            createdAt: identity.created_at,
            updatedAt: identity.updated_at,
            identityData: identity.identity_data || {}
          }))
        : [];
      return res.status(200).json({
        ok: true,
        exportedAt: new Date().toISOString(),
        account: {
          id: target.id,
          email: target.email || '',
          phone: target.phone || '',
          createdAt: target.created_at || '',
          updatedAt: target.updated_at || '',
          lastSignInAt: target.last_sign_in_at || '',
          confirmedAt: target.confirmed_at || target.email_confirmed_at || '',
          bannedUntil: target.banned_until || '',
          appMetadata: target.app_metadata || {},
          userMetadata: target.user_metadata || {},
          identities
        },
        profile
      });
    }

    if (action === 'delete') {
      const response = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`
        }
      });
      const body = await jsonResponse(response);
      if (!response.ok) {
        return res.status(response.status).json({
          error: body?.msg || body?.message || body?.error_description || 'Não foi possível apagar a conta.'
        });
      }
      return res.status(200).json({ ok: true, deleted: true });
    }

    const banned = action === 'ban';
    const now = new Date().toISOString();
    const appMetadata = {
      ...(target.app_metadata || {}),
      banned,
      banned_at: banned ? now : null,
      ban_reason: banned ? reason : null
    };
    const response = await fetch(`${url}/auth/v1/admin/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ban_duration: banned ? '876000h' : 'none',
        app_metadata: appMetadata
      })
    });
    const body = await jsonResponse(response);
    if (!response.ok) {
      return res.status(response.status).json({
        error: body?.msg || body?.message || body?.error_description || 'Não foi possível atualizar o bloqueio.'
      });
    }

    const profileWarning = await patchProfile(url, serviceKey, userId, {
      banned,
      banned_at: banned ? now : null,
      ban_reason: banned ? reason : '',
      updated_at: now
    });

    return res.status(200).json({
      ok: true,
      banned,
      warning: profileWarning || undefined
    });
  } catch (error) {
    return res.status(error?.status || 500).json({
      error: error?.message || 'Falha interna ao gerenciar o usuário.'
    });
  }
};
