'use strict';

module.exports = async function deleteAccountHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const supabaseUrl = String(
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://cxkevnnxibhezvospkce.supabase.co'
  ).replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

  if (!serviceRoleKey) {
    return res.status(503).json({
      error: 'Configure SUPABASE_SERVICE_ROLE_KEY nas variáveis do projeto Vercel para habilitar a exclusão de conta.'
    });
  }
  if (!accessToken) return res.status(401).json({ error: 'Sessão não encontrada.' });

  try {
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${accessToken}`
      }
    });
    const user = await userResponse.json().catch(() => null);
    if (!userResponse.ok || !user?.id) {
      return res.status(401).json({ error: user?.msg || user?.message || 'Sessão inválida ou expirada.' });
    }

    const deleteResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
      method: 'DELETE',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`
      }
    });
    const result = await deleteResponse.json().catch(() => ({}));
    if (!deleteResponse.ok) {
      return res.status(deleteResponse.status).json({
        error: result?.msg || result?.message || result?.error_description || 'Não foi possível excluir a conta.'
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Falha interna ao excluir a conta.' });
  }
};
