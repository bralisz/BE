'use strict';

const dns = require('node:dns').promises;

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


const EMAIL_DOMAIN_CACHE = globalThis.__betvEmailDomainCache || new Map();
globalThis.__betvEmailDomainCache = EMAIL_DOMAIN_CACHE;
const EMAIL_DOMAIN_CACHE_MS = 6 * 60 * 60 * 1000;
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com','10minutemail.net','20minutemail.com','33mail.com','anonaddy.com','dispostable.com',
  'emailondeck.com','fakeinbox.com','fakemail.net','getnada.com','guerrillamail.com','guerrillamail.net',
  'maildrop.cc','mailinator.com','mailnesia.com','mintemail.com','moakt.com','mytemp.email','sharklasers.com',
  'temp-mail.org','tempail.com','tempmail.com','tempmail.net','tempmailo.com','throwawaymail.com','trashmail.com',
  'yopmail.com','yopmail.fr','yopmail.net'
]);

function normalizeEmailAddress(value) {
  const email = String(value || '').trim().toLowerCase();
  if (email.length < 6 || email.length > 254 || /\s/.test(email)) return null;
  const at = email.lastIndexOf('@');
  if (at <= 0 || at !== email.indexOf('@')) return null;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!local || local.length > 64 || !domain || domain.length > 253) return null;
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return null;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return null;
  const labels = domain.split('.');
  if (labels.length < 2 || labels.some(label => !label || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label))) return null;
  const tld = labels[labels.length - 1];
  if (!/^[a-z]{2,63}$/i.test(tld)) return null;
  return { email, local, domain };
}

function isDisposableEmailDomain(domain) {
  const normalized = String(domain || '').toLowerCase();
  if (DISPOSABLE_EMAIL_DOMAINS.has(normalized)) return true;
  return Array.from(DISPOSABLE_EMAIL_DOMAINS).some(blocked => normalized.endsWith(`.${blocked}`));
}

function dnsFailureKind(error) {
  const code = String(error && error.code || '').toUpperCase();
  if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'ENONAME') return 'not-found';
  if (code === 'ETIMEOUT' || code === 'ESERVFAIL' || code === 'EREFUSED' || code === 'ECONNREFUSED') return 'temporary';
  return 'unknown';
}

async function dnsOverHttps(domain, type) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2200);
  try {
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`, {
      headers: { Accept: 'application/dns-json' },
      signal: controller.signal
    });
    if (!response.ok) return null;
    return await response.json().catch(() => null);
  } catch (_) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function validateEmailDomainWithDoh(domain) {
  const mx = await dnsOverHttps(domain, 'MX');
  if (!mx) return { valid: null, deliverable: null, disposable: false, checkAvailable: false, reason: 'dns-temporary' };
  if (Number(mx.Status) === 3) return { valid: false, deliverable: false, disposable: false, checkAvailable: true, reason: 'nxdomain' };
  if (Number(mx.Status) !== 0) return { valid: null, deliverable: null, disposable: false, checkAvailable: false, reason: 'dns-temporary' };

  const mxAnswers = Array.isArray(mx.Answer) ? mx.Answer.filter(item => Number(item && item.type) === 15) : [];
  if (mxAnswers.length) {
    const exchanges = mxAnswers.map(item => String(item && item.data || '').trim().replace(/^\d+\s+/, '').replace(/\.$/, ''));
    if (exchanges.some(exchange => exchange && exchange !== '.')) return { valid: true, deliverable: true, disposable: false, checkAvailable: true, reason: 'mx-doh' };
    if (exchanges.some(exchange => exchange === '.' || exchange === '')) return { valid: false, deliverable: false, disposable: false, checkAvailable: true, reason: 'null-mx' };
  }

  const [a, aaaa] = await Promise.all([dnsOverHttps(domain, 'A'), dnsOverHttps(domain, 'AAAA')]);
  const hasAddress = [a, aaaa].some(result => result && Number(result.Status) === 0 && Array.isArray(result.Answer) && result.Answer.length > 0);
  if (hasAddress) return { valid: true, deliverable: true, disposable: false, checkAvailable: true, reason: 'address-doh' };
  const nxdomain = [a, aaaa].some(result => result && Number(result.Status) === 3);
  if (nxdomain) return { valid: false, deliverable: false, disposable: false, checkAvailable: true, reason: 'nxdomain' };
  return { valid: false, deliverable: false, disposable: false, checkAvailable: true, reason: 'no-mail-dns' };
}

async function validateEmailDomain(domain) {
  const normalized = String(domain || '').trim().toLowerCase();
  const cached = EMAIL_DOMAIN_CACHE.get(normalized);
  if (cached && Date.now() - cached.checkedAt < EMAIL_DOMAIN_CACHE_MS) return cached.value;

  if (!normalized || isDisposableEmailDomain(normalized)) {
    const value = { valid: false, deliverable: false, disposable: Boolean(normalized), checkAvailable: true, reason: 'disposable-or-invalid' };
    EMAIL_DOMAIN_CACHE.set(normalized, { checkedAt: Date.now(), value });
    return value;
  }

  let mx = [];
  try {
    mx = await dns.resolveMx(normalized);
    const usableMx = Array.isArray(mx) && mx.some(record => String(record && record.exchange || '').trim() && record.exchange !== '.');
    if (usableMx) {
      const value = { valid: true, deliverable: true, disposable: false, checkAvailable: true, reason: 'mx' };
      EMAIL_DOMAIN_CACHE.set(normalized, { checkedAt: Date.now(), value });
      return value;
    }
    if (Array.isArray(mx) && mx.some(record => String(record && record.exchange || '').trim() === '.')) {
      const value = { valid: false, deliverable: false, disposable: false, checkAvailable: true, reason: 'null-mx' };
      EMAIL_DOMAIN_CACHE.set(normalized, { checkedAt: Date.now(), value });
      return value;
    }
  } catch (error) {
    const kind = dnsFailureKind(error);
    if (kind === 'temporary') return validateEmailDomainWithDoh(normalized);
    if (kind !== 'not-found') return validateEmailDomainWithDoh(normalized);
  }

  // RFC 5321 permite entrega implícita no host quando não existe MX explícito.
  // Por isso, só rejeitamos definitivamente se MX e A/AAAA não existirem.
  try {
    const addresses = await dns.resolve4(normalized);
    if (Array.isArray(addresses) && addresses.length) {
      const value = { valid: true, deliverable: true, disposable: false, checkAvailable: true, reason: 'a-record' };
      EMAIL_DOMAIN_CACHE.set(normalized, { checkedAt: Date.now(), value });
      return value;
    }
  } catch (error) {
    const kind = dnsFailureKind(error);
    if (kind === 'temporary') return validateEmailDomainWithDoh(normalized);
  }

  try {
    const addresses = await dns.resolve6(normalized);
    if (Array.isArray(addresses) && addresses.length) {
      const value = { valid: true, deliverable: true, disposable: false, checkAvailable: true, reason: 'aaaa-record' };
      EMAIL_DOMAIN_CACHE.set(normalized, { checkedAt: Date.now(), value });
      return value;
    }
  } catch (error) {
    const kind = dnsFailureKind(error);
    if (kind === 'temporary') return validateEmailDomainWithDoh(normalized);
  }

  const value = { valid: false, deliverable: false, disposable: false, checkAvailable: true, reason: 'no-mail-dns' };
  EMAIL_DOMAIN_CACHE.set(normalized, { checkedAt: Date.now(), value });
  return value;
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
  const { url, publishableKey, serviceRoleKey } = getConfig();

  if (req.method === 'POST') {
    if (!validRequestOrigin(req)) return res.status(403).json({ ok: false, error: 'Origem da solicitação não permitida.' });

    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    const parsedEmail = normalizeEmailAddress(body?.email);
    if (!parsedEmail) {
      return res.status(400).json({ ok: false, error: 'E-mail inválido.', domainValid: false, domainCheckAvailable: true });
    }

    const domainCheck = await validateEmailDomain(parsedEmail.domain);
    let exists = null;
    let accountCheckAvailable = false;

    if (serviceRoleKey) {
      try {
        const profileResponse = await fetch(
          `${url}/rest/v1/profiles?email=eq.${encodeURIComponent(parsedEmail.email)}&select=id&limit=1`,
          { headers: serviceHeaders(serviceRoleKey, { Accept: 'application/json' }) }
        );
        const profiles = await readJson(profileResponse);
        if (profileResponse.ok) {
          exists = Array.isArray(profiles) && profiles.length > 0;
          accountCheckAvailable = true;
        }
      } catch (_) {}
    }

    // Uma conta já existente continua podendo entrar mesmo que o DNS do domínio
    // esteja temporariamente indisponível ou tenha mudado depois do cadastro.
    return res.status(200).json({
      ok: true,
      exists,
      checkAvailable: accountCheckAvailable,
      domain: parsedEmail.domain,
      domainValid: domainCheck.valid,
      domainDeliverable: domainCheck.deliverable,
      domainDisposable: domainCheck.disposable,
      domainCheckAvailable: domainCheck.checkAvailable,
      domainReason: domainCheck.reason
    });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
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
