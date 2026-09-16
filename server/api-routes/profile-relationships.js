'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';

function config() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SB_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
}

function username(value) { return String(value || '').trim().toLowerCase().replace(/^@+/, ''); }
function clean(value, max = 120) { return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max); }
function safeAsset(value) { const raw = String(value || '').trim(); return raw.length <= 2000 ? raw : ''; }
function validUsername(value) { return /^[a-z0-9](?:[a-z0-9._]{1,18}[a-z0-9])?$/.test(value) && value.length >= 3 && value.length <= 20 && !value.includes('..') && !value.includes('__') && !value.includes('._') && !value.includes('_.'); }
function mapProfile(row) {
  return {
    id: clean(row.id),
    username: username(row.username),
    displayName: clean(row.display_name || row.displayName || 'Usuário', 80),
    avatarUrl: safeAsset(row.avatar_url || row.avatarUrl),
    communityTag: clean(row.community_tag || row.communityTag, 20).toLowerCase()
  };
}

async function rest(path, options = {}) {
  const { url, key } = config();
  if (!key) throw new Error('supabase_key_missing');
  const response = await fetch(`${url}${path}`, {
    method: options.method || 'GET',
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json', ...(options.headers || {}) },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`supabase_${response.status}`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

module.exports = async function profileRelationships(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return res.status(405).end(); }
  const targetUsername = username(Array.isArray(req.query?.username) ? req.query.username[0] : req.query?.username);
  const type = String(Array.isArray(req.query?.type) ? req.query.type[0] : req.query?.type || 'followers').toLowerCase() === 'following' ? 'following' : 'followers';
  const search = String(Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q || '').trim().toLowerCase().slice(0, 80);
  const offset = Math.max(0, Number.parseInt(Array.isArray(req.query?.offset) ? req.query.offset[0] : req.query?.offset, 10) || 0);
  const limit = Math.min(50, Math.max(1, Number.parseInt(Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit, 10) || 15));
  if (!validUsername(targetUsername)) return res.status(400).json({ items: [], total: 0, offset, limit, hasMore: false });

  try {
    const targets = await rest(`/rest/v1/profiles?select=id,username,banned&username=eq.${encodeURIComponent(targetUsername)}&limit=1`);
    const target = targets[0];
    if (!target || target.banned === true) return res.status(404).json({ items: [], total: 0, offset, limit, hasMore: false });

    const matchColumn = type === 'following' ? 'follower_id' : 'following_id';
    const resultColumn = type === 'following' ? 'following_id' : 'follower_id';
    const relations = await rest(`/rest/v1/profile_follows?select=follower_id,following_id&${matchColumn}=eq.${encodeURIComponent(clean(target.id))}&limit=5000`);
    const ids = relations.map(row => clean(row[resultColumn])).filter(Boolean);
    if (!ids.length) return res.status(200).json({ items: [], total: 0, offset, limit, hasMore: false });

    const idFilter = ids.map(id => `"${id}"`).join(',');
    const profiles = await rest(`/rest/v1/profiles?select=id,username,display_name,avatar_url,community_tag,banned&id=in.(${encodeURIComponent(idFilter)})&limit=5000`);
    const order = new Map(ids.map((id, index) => [id, index]));
    let items = profiles.filter(row => row.banned !== true).map(mapProfile).filter(item => validUsername(item.username));
    if (search) items = items.filter(item => item.username.includes(search) || item.displayName.toLowerCase().includes(search));
    items.sort((a, b) => (order.get(a.id) ?? 999999) - (order.get(b.id) ?? 999999));
    const total = items.length;
    const page = items.slice(offset, offset + limit);
    return res.status(200).json({ items: page, total, offset, limit, hasMore: offset + page.length < total });
  } catch (error) {
    console.error('profile relationships failed:', error);
    return res.status(503).json({ items: [], total: 0, offset, limit, hasMore: false });
  }
};
