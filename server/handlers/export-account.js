'use strict';

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

function config() {
  return {
    url: String(
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://cxkevnnxibhezvospkce.supabase.co'
    ).replace(/\/$/, ''),
    publishableKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      DEFAULT_PUBLISHABLE_KEY
  };
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) { return { message: text }; }
}

function validRequestOrigin(req) {
  const origin = String(req.headers.origin || '');
  const host = String(req.headers.host || '');
  if (!origin || !host) return true;
  try { return new URL(origin).host === host; } catch (_) { return false; }
}

module.exports = async function exportAccountHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Content-Disposition', 'attachment; filename="dados-betv.json"');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!validRequestOrigin(req)) return res.status(403).json({ error: 'Origem da solicitação não permitida.' });

  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!accessToken) return res.status(401).json({ error: 'Sessão não encontrada.' });

  const { url, publishableKey } = config();

  try {
    const userResponse = await fetch(`${url}/auth/v1/user`, {
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });
    const user = await readJson(userResponse);
    if (!userResponse.ok || !user?.id) {
      return res.status(401).json({ error: user?.message || user?.msg || 'Sessão inválida ou expirada.' });
    }

    const profileResponse = await fetch(
      `${url}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=*`,
      {
        headers: {
          apikey: publishableKey,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );
    const profiles = await readJson(profileResponse);
    const profile = profileResponse.ok && Array.isArray(profiles) ? profiles[0] || null : null;

    const identities = Array.isArray(user.identities)
      ? user.identities.map(identity => ({
          id: identity.id || '',
          provider: identity.provider || '',
          createdAt: identity.created_at || '',
          updatedAt: identity.updated_at || '',
          lastSignInAt: identity.last_sign_in_at || '',
          identityData: identity.identity_data || {}
        }))
      : [];

    return res.status(200).json({
      ok: true,
      exportedAt: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email || '',
        phone: user.phone || '',
        createdAt: user.created_at || '',
        updatedAt: user.updated_at || '',
        lastSignInAt: user.last_sign_in_at || '',
        confirmedAt: user.confirmed_at || user.email_confirmed_at || '',
        appMetadata: user.app_metadata || {},
        userMetadata: user.user_metadata || {},
        identities
      },
      profile
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Não foi possível exportar os dados da conta.' });
  }
};
