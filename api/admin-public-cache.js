
'use strict';

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const FEATURED_CACHE_TAG = 'betv-featured';

function config() {
  return {
    supabaseUrl: String(
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://cxkevnnxibhezvospkce.supabase.co'
    ).replace(/\/$/, ''),
    publishableKey:
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      DEFAULT_PUBLISHABLE_KEY,
    vercelToken: String(
      process.env.VERCEL_API_TOKEN ||
      process.env.VERCEL_ACCESS_TOKEN ||
      process.env.VERCEL_TOKEN ||
      ''
    ).trim(),
    projectIdOrName: String(
      process.env.VERCEL_PROJECT_ID ||
      process.env.VERCEL_PROJECT_NAME ||
      'be'
    ).trim(),
    teamId: String(process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || '').trim(),
    target: String(process.env.VERCEL_ENV || '').toLowerCase() === 'preview' ? 'preview' : 'production'
  };
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch (_) { return null; }
}

function sameOriginRequest(req) {
  const origin = String(req.headers.origin || '').trim();
  if (!origin) return true;
  try { return new URL(origin).host === String(req.headers.host || '').trim(); }
  catch (_) { return false; }
}

async function assertAdmin(settings, accessToken) {
  const userResponse = await fetch(`${settings.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: settings.publishableKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: 'no-store'
  });
  const user = await readJson(userResponse);
  if (!userResponse.ok || !user?.id) {
    const error = new Error('Sessão inválida ou expirada.');
    error.status = 401;
    throw error;
  }

  const adminResponse = await fetch(`${settings.supabaseUrl}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      apikey: settings.publishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: '{}',
    cache: 'no-store'
  });
  const allowed = await readJson(adminResponse);
  if (!adminResponse.ok || allowed !== true) {
    const error = new Error('Apenas o administrador pode atualizar o cache público.');
    error.status = 403;
    throw error;
  }
}

async function deleteFeaturedCache(settings) {
  if (!settings.vercelToken || !settings.projectIdOrName) {
    const error = new Error('Integração de cache da Vercel não configurada.');
    error.status = 503;
    throw error;
  }
  const url = new URL('/v1/edge-cache/dangerously-delete-by-tags', 'https://api.vercel.com');
  url.searchParams.set('projectIdOrName', settings.projectIdOrName);
  if (settings.teamId) url.searchParams.set('teamId', settings.teamId);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.vercelToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tags: [FEATURED_CACHE_TAG],
      target: settings.target,
      revalidationDeadlineSeconds: 10
    }),
    cache: 'no-store'
  });
  if (!response.ok) {
    const payload = await readJson(response);
    const error = new Error(payload?.error?.message || payload?.message || `A Vercel recusou a invalidação (${response.status}).`);
    error.status = response.status >= 400 && response.status < 600 ? response.status : 502;
    throw error;
  }
}

module.exports = async function adminPublicCache(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  if (!sameOriginRequest(req)) return res.status(403).json({ ok: false });

  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!accessToken) return res.status(401).json({ ok: false });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (String(body.scope || '').trim().toLowerCase() !== 'featured') {
    return res.status(400).json({ ok: false, message: 'Escopo de cache inválido.' });
  }

  try {
    const settings = config();
    await assertAdmin(settings, accessToken);
    await deleteFeaturedCache(settings);
    return res.status(200).json({ ok: true, scope: 'featured' });
  } catch (error) {
    return res.status(Number(error?.status || 500)).json({
      ok: false,
      message: String(error?.message || 'Não foi possível atualizar o cache público.')
    });
  }
};
