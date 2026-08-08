'use strict';

const crypto = require('crypto');

const DEFAULT_PUBLISHABLE_KEY = 'sb_publishable_yj_yBwVhaUPj7nQdcFDxrg_g_ukcwTX';

function envConfig() {
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
    projectId: String(process.env.VERCEL_PROJECT_ID || '').trim(),
    teamId: String(process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || '').trim()
  };
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch (_) { return { message: text }; }
}

function apiError(payload, fallback, status) {
  const message = payload?.error?.message || payload?.message || payload?.error_description || payload?.error || fallback;
  const error = new Error(String(message || fallback || 'Erro inesperado.'));
  error.status = Number(status || 500);
  return error;
}

async function assertAdmin(supabaseUrl, publishableKey, accessToken) {
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`
    }
  });
  const user = await readJson(userResponse);
  if (!userResponse.ok || !user?.id) throw apiError(user, 'Sessão inválida ou expirada.', 401);

  const adminResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: '{}'
  });
  const allowed = await readJson(adminResponse);
  if (!adminResponse.ok || allowed !== true) {
    throw apiError(allowed, 'Apenas o administrador pode liberar uma atualização.', 403);
  }
  return user;
}

function sameOriginRequest(req) {
  const origin = String(req.headers.origin || '').trim();
  if (!origin) return true;
  try {
    return new URL(origin).host === String(req.headers.host || '').trim();
  } catch (_) {
    return false;
  }
}

function vercelUrl(path, teamId) {
  const url = new URL(path, 'https://api.vercel.com');
  if (teamId) url.searchParams.set('teamId', teamId);
  return url;
}

async function vercelRequest(config, method, path) {
  const response = await fetch(vercelUrl(path, config.teamId), {
    method,
    headers: {
      Authorization: `Bearer ${config.vercelToken}`,
      'Content-Type': 'application/json'
    }
  });
  const payload = await readJson(response);
  if (!response.ok) {
    const error = apiError(payload, `A Vercel recusou a solicitação (${response.status}).`, response.status);
    error.vercelCode = payload?.error?.code || '';
    throw error;
  }
  return payload;
}

function deploymentId(deployment) {
  return String(deployment?.uid || deployment?.id || '').trim();
}

function deploymentState(deployment) {
  return String(deployment?.readyState || deployment?.state || '').trim().toUpperCase();
}

function deploymentCommit(deployment) {
  const meta = deployment?.meta && typeof deployment.meta === 'object' ? deployment.meta : {};
  const gitSource = deployment?.gitSource && typeof deployment.gitSource === 'object' ? deployment.gitSource : {};
  return String(
    meta.githubCommitSha ||
    meta.gitlabCommitSha ||
    meta.bitbucketCommitSha ||
    meta.gitCommitSha ||
    meta.commitSha ||
    gitSource.sha ||
    ''
  ).trim();
}

function deploymentVersion(deployment) {
  const commit = deploymentCommit(deployment);
  const url = String(deployment?.url || '').trim();
  if (!url) return '';
  const fingerprint = crypto
    .createHash('sha256')
    .update(`${commit}:${url}`)
    .digest('hex')
    .slice(0, 24);
  return `v:${fingerprint}`;
}

function deploymentSummary(deployment) {
  if (!deployment) return null;
  const id = deploymentId(deployment);
  const url = String(deployment.url || '').trim();
  const meta = deployment.meta && typeof deployment.meta === 'object' ? deployment.meta : {};
  return {
    id,
    url,
    version: deploymentVersion(deployment),
    createdAt: Number(deployment.createdAt || deployment.created || 0) || 0,
    readyAt: Number(deployment.ready || deployment.readyAt || 0) || 0,
    state: deploymentState(deployment),
    target: String(deployment.target || ''),
    branch: String(meta.githubCommitRef || meta.gitlabCommitRef || meta.bitbucketCommitRef || meta.gitBranch || ''),
    commitSha: deploymentCommit(deployment),
    commitMessage: String(meta.githubCommitMessage || meta.gitlabCommitMessage || meta.bitbucketCommitMessage || meta.gitCommitMessage || '')
  };
}

async function deploymentStateForProject(config) {
  const [project, deploymentsPayload] = await Promise.all([
    vercelRequest(config, 'GET', `/v9/projects/${encodeURIComponent(config.projectId)}`),
    vercelRequest(config, 'GET', `/v6/deployments?projectId=${encodeURIComponent(config.projectId)}&limit=30`)
  ]);

  const productionTarget = project?.targets?.production || null;
  const activeProductionId = deploymentId(productionTarget);
  const activeCreatedAt = Number(productionTarget?.createdAt || productionTarget?.created || 0) || 0;
  const deployments = Array.isArray(deploymentsPayload?.deployments) ? deploymentsPayload.deployments : [];

  const readyProduction = deployments
    .filter(item => deploymentState(item) === 'READY')
    .filter(item => String(item?.target || '').toLowerCase() === 'production')
    .sort((a, b) => Number(b.createdAt || b.created || 0) - Number(a.createdAt || a.created || 0));

  // Só considera como "em espera" um deploy mais novo que o Production ativo.
  // Isso evita confundir deploys históricos/antigos com uma atualização pendente.
  const stagedDeployment = readyProduction.find(item => {
    const id = deploymentId(item);
    if (!id || id === activeProductionId) return false;
    const createdAt = Number(item?.createdAt || item?.created || 0) || 0;
    if (activeCreatedAt) return createdAt > activeCreatedAt;
    return item?.aliasAssigned === false;
  }) || null;
  const activeDeployment = productionTarget || readyProduction.find(item => deploymentId(item) === activeProductionId) || null;

  return {
    activeProductionId,
    activeDeployment,
    stagedDeployment
  };
}

module.exports = async function adminDeploymentRelease(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Vary', 'Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  if (!sameOriginRequest(req)) return res.status(403).json({ error: 'Origem da solicitação não permitida.' });

  const authorization = String(req.headers.authorization || '');
  const accessToken = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!accessToken) return res.status(401).json({ error: 'Sessão administrativa não encontrada.' });

  const config = envConfig();
  if (!config.vercelToken) {
    return res.status(503).json({
      error: 'Integração com a Vercel não configurada. Adicione VERCEL_API_TOKEN nas variáveis de ambiente da Vercel.'
    });
  }
  if (!config.projectId) {
    return res.status(503).json({
      error: 'VERCEL_PROJECT_ID não está disponível. Ative “Automatically expose System Environment Variables” na Vercel.'
    });
  }

  try {
    const admin = await assertAdmin(config.supabaseUrl, config.publishableKey, accessToken);
    const state = await deploymentStateForProject(config);

    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        configured: true,
        activeDeployment: deploymentSummary(state.activeDeployment),
        stagedDeployment: deploymentSummary(state.stagedDeployment),
        hasStagedDeployment: Boolean(state.stagedDeployment)
      });
    }

    const requestedDeploymentId = String(req.body?.deploymentId || '').trim();
    const target = state.stagedDeployment;
    const targetId = deploymentId(target);

    if (!target || !targetId) {
      return res.status(409).json({ error: 'Não há uma nova versão pronta aguardando liberação.' });
    }
    if (requestedDeploymentId && requestedDeploymentId !== targetId) {
      return res.status(409).json({ error: 'Existe um deploy mais recente. Atualize o painel antes de liberar a versão.' });
    }

    const targetSummary = deploymentSummary(target);
    if (!targetSummary?.version) {
      return res.status(409).json({ error: 'Não foi possível identificar com segurança a versão do deploy que será liberado.' });
    }

    await vercelRequest(
      config,
      'POST',
      `/v10/projects/${encodeURIComponent(config.projectId)}/promote/${encodeURIComponent(targetId)}`
    );

    return res.status(200).json({
      ok: true,
      promoted: true,
      promotedBy: admin.email || admin.id,
      deployment: targetSummary
    });
  } catch (error) {
    console.error('Falha ao liberar deployment da Vercel:', error);
    const status = Number(error?.status || 500);
    let message = error?.message || 'Não foi possível liberar a atualização na Vercel.';
    if ((status === 403 || status === 404) && config.teamId === '') {
      message += ' Se o projeto estiver em uma equipe, configure também VERCEL_TEAM_ID.';
    }
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
};
