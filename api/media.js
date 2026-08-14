'use strict';

const mediaHandler = require('../server/handlers/media');
const driveMediaHandler = require('../server/handlers/drive-media');

module.exports = async function mediaRouter(req, res) {
  const raw = Array.isArray(req.query?.handler) ? req.query.handler[0] : req.query?.handler;
  if (String(raw || '').trim().toLowerCase() === 'drive-media') {
    return driveMediaHandler(req, res);
  }
  return mediaHandler(req, res);
};
