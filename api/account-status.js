'use strict';

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
  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!accessToken) return res.status(401).json({ error: 'Sessão não encontrada.' });
  if (!serviceRoleKey) return res.status(200).json({ ok: true, banned: false, checkAvailable: false });

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${accessToken}`
      }
    });
    const sessionUser = await userResponse.json().catch(() => null);
    if (!userResponse.ok || !sessionUser?.id) {
      return res.status(401).json({ error: sessionUser?.msg || sessionUser?.message || 'Sessão inválida.' });
    }

    const adminResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(sessionUser.id)}`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    });
    const account = await adminResponse.json().catch(() => null);
    if (!adminResponse.ok || !account?.id) {
      return res.status(200).json({ ok: true, banned: false, checkAvailable: false });
    }

    const banned = Boolean(account.app_metadata?.banned) || (
      account.banned_until && new Date(account.banned_until).getTime() > Date.now()
    );
    return res.status(200).json({
      ok: true,
      banned,
      bannedAt: account.app_metadata?.banned_at || '',
      reason: account.app_metadata?.ban_reason || ''
    });
  } catch (error) {
    return res.status(200).json({ ok: true, banned: false, checkAvailable: false });
  }
};
