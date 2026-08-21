'use strict';

const mediaHandler = require('../handlers/media');
const driveMediaHandler = require('../handlers/drive-media');
const vkMediaHandler = require('../handlers/vk-media');

module.exports = async function mediaRouter(req, res) {
  const raw = Array.isArray(req.query?.handler) ? req.query.handler[0] : req.query?.handler;
  const handler = String(raw || '').trim().toLowerCase();
  if (handler === 'drive-media') return driveMediaHandler(req, res);
  if (handler === 'vk-media') return vkMediaHandler(req, res);
  return mediaHandler(req, res);
};
