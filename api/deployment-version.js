'use strict';

function deploymentVersion() {
  const commit = String(process.env.VERCEL_GIT_COMMIT_SHA || '').trim();
  const deploymentUrl = String(process.env.VERCEL_URL || '').trim();
  const environment = String(process.env.VERCEL_ENV || process.env.NODE_ENV || 'development').trim();

  if (commit || deploymentUrl) {
    return [commit || 'no-commit', deploymentUrl || 'no-deployment-url'].join(':');
  }

  return `local:${environment}`;
}

module.exports = function deploymentVersionHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  const payload = {
    version: deploymentVersion(),
    commit: String(process.env.VERCEL_GIT_COMMIT_SHA || '').trim(),
    environment: String(process.env.VERCEL_ENV || process.env.NODE_ENV || 'development').trim()
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).json(payload);
};
