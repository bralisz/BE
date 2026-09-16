'use strict';

const DEFAULT_URL = 'https://cxkevnnxibhezvospkce.supabase.co';
const DEFAULT_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

function cfg() {
  return {
    url: String(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SB_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY
  };
}

async function rest(path) {
  const { url, key } = cfg();
  const response = await fetch(`${url}${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error(`supabase_${response.status}`);
  return response.json();
}

function username(value) { return String(value || '').trim().toLowerCase().replace(/^@+/, ''); }
function clean(value) { return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 80); }
function mapProfile(row) {
  return { id: clean(row.id), username: username(row.username), displayName: clean(row.display_name || row.displayName || 'Usuário'), avatarUrl: clean(row.avatar_url || row.avatarUrl), communityTag: clean(row.community_tag || row.communityTag).toLowerCase() };
}

module.exports = async function profileRelationships(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
  const targetUsername = username(Array.isArray(req.query?.username) ? req.query.username[0] : req.query?.username);
  const type = String(Array.isArray(req.query?.type) ? req.query.type[0] : req.query?.type || 'followers').toLowerCase() === 'following' ? 'following' : 'followers';
  const search = String(Array.isArray(req.query?.q) ? req.query.q[0] : req.query?.q || '').trim().toLowerCase().slice(0, 80);
  const offset = Math.max(0, Number.parseInt(Array.isArray(req.query?.offset) ? req.query.offset[0] : req.query?.offset, 10) || 0);
  const limit = Math.min(50, Math.max(1, Number.parseInt(Array.isArray(req.query?.limit) ? req.query.limit[0] : req.query?.limit, 10) || 15));

  try {
    const profiles = await rest(`/rest/v1/profiles?select=id,username,display_name,avatar_url,community_tag&username=eq.${encodeURIComponent(targetUsername)}&banned=eq.false&limit=1`);
    const target = Array.isArray(profiles) ? profiles[0] : null;
    if (!target) return res.status(404).json({ items: [], total: 0, offset, limit, hasMore: false });

    const relationColumn = type === 'following' ? 'following_id' : 'follower_id';
    const matchColumn = type === 'following' ? 'follower_id' : 'following_id';
    const matchValue = clean(target.id);
    const relationRows = await rest(`/rest/v1/profile_follows?select=follower_id,following_id&${matchColumn}=eq.${encodeURIComponent(matchValue)}&limit=1000`);
    const ids = (Array.isArray(relationRows) ? relationRows : []).map(row => clean(row[relationColumn])).filter(Boolean);
    if (!ids.length) return res.status(200).json({ items: [], total: 0, offset, limit, hasMore: false });

    const idList = ids.map(id => `"${id}"`).join(',');
    const candidateRows = await rest(`/rest/v1/profiles?select=id,username,display_name,avatar_url,community_tag&id=in.(${encodeURIComponent(idList)})&banned=eq.false`);
    const order = new Map(ids.map((id, index) => [id, index]));
    let items = (Array.isArray(candidateRows) ? candidateRows : []).map(mapProfile).filter(item => item.username);
    if (search) items = items.filter(item => item.username.includes(search) || item.displayName.toLowerCase().includes(search));
    items.sort((a, b) => (order.get(a.id) ?? 999999) - (order.get(b.id) ?? 999999));
    const total = items.length;
    const page = items.slice(offset, offset + limit);
    return res.status(200).json({ items: page, total, offset, limit, hasMore: offset + page.length < total });
  } catch (_) {
    return res.status(503).json({ items: [], total: 0, offset, limit, hasMore: false });
  }
};
