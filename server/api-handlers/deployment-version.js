'use strict';

const crypto = require('crypto');

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';
const RELEASE_CACHE_TTL_MS = 15 * 60 * 1000;
let releaseCache = { value: null, expiresAt: 0, promise: null };

function deploymentVersion() {
  const commit = String(process.env.VERCEL_GIT_COMMIT_SHA || '').trim();
  const deploymentUrl = String(process.env.VERCEL_URL || '').trim();
  const environment = String(process.env.VERCEL_ENV || process.env.NODE_ENV || 'development').trim();

  if (!commit && !deploymentUrl) return `local:${environment}`;
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${commit}:${deploymentUrl}`)
    .digest('hex')
    .slice(0, 24);
  return `v:${fingerprint}`;
}

function supabaseConfig() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY
  };
}

async function loadReleaseState(forceRefresh = false) {
  const now = Date.now();
  if (forceRefresh) releaseCache = { value: null, expiresAt: 0, promise: null };
  if (releaseCache.value && releaseCache.expiresAt > now) return releaseCache.value;
  if (releaseCache.promise) return releaseCache.promise;

  releaseCache.promise = (async () => {
    const { url, key } = supabaseConfig();
    try {
      const headers = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      };
      async function requestSetting(functionName, body) {
        const response = await fetch(`${url}/rest/v1/rpc/${functionName}`, {
          method: 'POST', headers, body: JSON.stringify(body), cache: 'no-store'
        });
        if (!response.ok) throw new Error('release_state_unavailable');
        const payload = await response.json().catch(() => null);
        return Array.isArray(payload) ? payload[0] : payload;
      }
      let value;
      try {
        value = await requestSetting('get_public_site_setting_v2', { p_id: 'site', p_locale: 'pt-br' });
      } catch (_) {
        value = await requestSetting('get_public_site_setting', { p_id: 'site' });
      }
      releaseCache.value = {
        releaseStateAvailable: true,
        updateReleaseEnabled: value && (value.updateReleaseEnabled === true || String(value.updateReleaseEnabled || '').toLowerCase() === 'true'),
        releasedDeploymentVersion: String(value && value.releasedDeploymentVersion || '').trim()
      };
      releaseCache.expiresAt = Date.now() + RELEASE_CACHE_TTL_MS;
      return releaseCache.value;
    } catch (_) {
      // A versão do deploy continua funcionando mesmo se o Supabase estiver
      // temporariamente indisponível. O navegador preserva o último estado de
      // liberação conhecido em vez de fazer uma segunda chamada à Vercel.
      return {
        releaseStateAvailable: false,
        updateReleaseEnabled: false,
        releasedDeploymentVersion: ''
      };
    } finally {
      releaseCache.promise = null;
    }
  })();
  return releaseCache.promise;
}

module.exports = async function deploymentVersionHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const fresh = String(req.query?.fresh || '').trim();
  const forceRefresh = Boolean(fresh);
  const release = await loadReleaseState(forceRefresh);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (forceRefresh) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=3600');
    res.setHeader('Vercel-CDN-Cache-Control', 'public, max-age=900, stale-while-revalidate=7200');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).json({ version: deploymentVersion(), ...release });
};
