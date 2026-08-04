'use strict';

const crypto = require('crypto');

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

module.exports = function deploymentVersionHandler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

  if (req.method === 'HEAD') return res.status(200).end();
  return res.status(200).json({ version: deploymentVersion() });
};
