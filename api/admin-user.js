'use strict';

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

function envConfig() {
  return {
    url: String(
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://cxkevnnxibhezvospkce.supabase.co'
    ).replace(/\/$/, ''),
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    publishableKey: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY
  };
}

async function jsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (_) { return { message: text }; }
}

async function getUserByToken(url, apiKey, accessToken) {
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
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


async function requesterIsAdmin(url, publishableKey, accessToken) {
  const response = await fetch(`${url}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });
  const body = await jsonResponse(response);
  return response.ok && body === true;
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

async function getProfile(url, apiKey, bearerToken, userId) {
  const response = await fetch(
    `${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
    {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${bearerToken}`,
        Accept: 'application/json'
      }
    }
  );
  const body = await jsonResponse(response);
  if (!response.ok) {
    const error = new Error(body?.message || body?.error || 'Não foi possível carregar o perfil.');
    error.status = response.status;
    throw error;
  }
  return Array.isArray(body) ? body[0] || null : null;
}

async function patchProfile(url, apiKey, bearerToken, userId, patch) {
  const response = await fetch(`${url}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(patch)
  });
  const body = await jsonResponse(response);
  if (!response.ok) {
    const error = new Error(body?.message || body?.error || 'Não foi possível atualizar o perfil.');
    error.status = response.status;
    throw error;
  }
  return Array.isArray(body) ? body[0] || null : body;
}

async function callAdminRpc(url, publishableKey, accessToken, action, userId, reason) {
  const response = await fetch(`${url}/rest/v1/rpc/admin_manage_user`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_action: action, p_user_id: userId, p_reason: reason || '' })
  });
  const body = await jsonResponse(response);
  if (!response.ok) return null;
  return body;
}

module.exports = async function adminUserHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const { url, serviceKey, publishableKey } = envConfig();
  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const action = String(req.body?.action || '').trim().toLowerCase();
  const userId = String(req.body?.userId || '').trim();
  const reason = String(req.body?.reason || '').trim().slice(0, 500);

  if (!accessToken) return res.status(401).json({ error: 'Sessão administrativa não encontrada.' });
  if (!userId) return res.status(400).json({ error: 'Usuário não informado.' });
  if (!['delete', 'ban', 'unban', 'export'].includes(action)) {
    return res.status(400).json({ error: 'Ação inválida.' });
  }

  try {
    const requester = await getUserByToken(url, serviceKey || publishableKey, accessToken);
    if (!await requesterIsAdmin(url, publishableKey, accessToken)) {
      return res.status(403).json({ error: 'Apenas o administrador pode realizar esta ação.' });
    }
    if (requester.id === userId) {
      return res.status(403).json({ error: 'A conta administrativa principal não pode ser alterada aqui.' });
    }

    if (!serviceKey) {
      const rpcResult = await callAdminRpc(url, publishableKey, accessToken, action, userId, reason);
      if (rpcResult) {
        return res.status(200).json({ ok: true, ...rpcResult });
      }

      const profile = await getProfile(url, publishableKey, accessToken, userId);
      if (!profile) return res.status(404).json({ error: 'Usuário não encontrado.' });
      if (profile.role === 'admin') {
        return res.status(403).json({ error: 'A conta administrativa principal não pode ser alterada aqui.' });
      }

      if (action === 'export') {
        return res.status(200).json({
          ok: true,
          exportedAt: new Date().toISOString(),
          account: {
            id: profile.id,
            email: profile.email || '',
            createdAt: profile.created_at || '',
            updatedAt: profile.updated_at || '',
            lastSignInAt: profile.last_login_at || '',
            bannedUntil: profile.banned ? 'indefinido' : '',
            source: 'perfil'
          },
          profile
        });
      }

      const now = new Date().toISOString();
      if (action === 'ban' || action === 'unban') {
        const banned = action === 'ban';
        const updatedProfile = await patchProfile(url, publishableKey, accessToken, userId, {
          banned,
          banned_at: banned ? now : null,
          ban_reason: banned ? reason : '',
          updated_at: now
        });
        return res.status(200).json({ ok: true, banned, profile: updatedProfile, mode: 'profile' });
      }

      const updatedProfile = await patchProfile(url, publishableKey, accessToken, userId, {
        email: `removed+${userId}@deleted.invalid`,
        display_name: 'Conta removida',
        username: null,
        bio: '',
        avatar_url: '',
        avatar_id: '',
        banner_url: '',
        banner_id: '',
        banned: true,
        banned_at: now,
        ban_reason: 'Conta removida pelo administrador',
        profile_complete: false,
        updated_at: now
      });
      return res.status(200).json({
        ok: true,
        deleted: true,
        softDeleted: true,
        profile: updatedProfile,
        mode: 'profile'
      });
    }

    const target = await getAdminUser(url, serviceKey, userId);
    if (target.app_metadata?.role === 'admin' || target.app_metadata?.is_admin === true) {
      return res.status(403).json({ error: 'A conta administrativa principal não pode ser alterada aqui.' });
    }

    if (action === 'export') {
      const profile = await getProfile(url, serviceKey, serviceKey, userId).catch(() => null);
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

    let profileWarning = '';
    try {
      await patchProfile(url, serviceKey, serviceKey, userId, {
        banned,
        banned_at: banned ? now : null,
        ban_reason: banned ? reason : '',
        updated_at: now
      });
    } catch (error) {
      profileWarning = error.message;
    }

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
