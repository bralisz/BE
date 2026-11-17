'use strict';

// Shared, stable URLs for public media. The numeric suffix prevents collisions
// between performances with the same name and keeps old URLs resolvable.
function numericPublicId(value) {
  const text = String(value || 'video').trim();
  if (/^\d{8}$/.test(text)) return text;
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return String(10000000 + ((hash >>> 0) % 90000000));
}

function contentSlug(value) {
  const input = String(value || 'conteudo').trim().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return input.slice(0, 88).replace(/-+$/,'') || 'conteudo';
}

function contentType(record) {
  const collection = String(record && record.collection || '').toLowerCase();
  if (collection === 'movies') return 'filme';
  if (collection === 'series') return 'serie';
  const data = record && record.data || {};
  const context = [
    data.sectionName, data.sectionSearch, data.sourceSectionTitle, data.category, data.categoryName,
    data.type, data.itemType, data.videoType, data.mediaType
  ].filter(Boolean).join(' ').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/podcast|podcast interview|podcast episode/.test(context)) return 'podcast';
  if (/entrevist|interview|entretien|intervista/.test(context)) return 'entrevista';
  if (/videoclip|video clip|music video|video musical|musical video|mv\b/.test(context)) return 'videoclipe';
  if (/\bshow\b|concert|live performance|ao vivo|apresentac|performance|festival|esibizione dal vivo|spectacle en direct/.test(context)) return 'show';
  return 'video';
}

function contentPath(record) {
  const data = record && record.data || {};
  const id = numericPublicId(data.publicId || record && record.id || data.id || data.title);
  const slug = contentSlug(data.slug || data.title || data.name);
  return '/' + contentType(record) + '/' + slug + '-' + id;
}

function friendlyContentRoute(value) {
  return /^\/(?:show|entrevista|podcast|videoclipe|video|filme|serie)\/[a-z0-9-]{2,120}$/i.test(String(value || ''));
}

function contentRouteId(value) {
  const match = String(value || '').match(/^\/(?:show|entrevista|podcast|videoclipe|video|filme|serie)\/[a-z0-9-]*-(\d{8})$/i);
  return match ? match[1] : '';
}

function mediaSetlist(data) {
  let value = data && (data.setlist || data.setList || data.songList || data.tracks) || [];
  if (typeof value === 'string') {
    try { if (/^\s*\[/.test(value)) value = JSON.parse(value); } catch (_) {}
    if (typeof value === 'string') value = value.split(/\r?\n/);
  }
  return (Array.isArray(value) ? value : []).slice(0, 150).map((item) => {
    const line = typeof item === 'string' ? item : item && (item.title || item.name || item.song);
    return String(line || '').replace(/^\s*\d+[.)\-]\s*/, '').trim().slice(0, 220);
  }).filter(Boolean);
}

module.exports = {
  numericPublicId, contentSlug, contentType, contentPath,
  friendlyContentRoute, contentRouteId, mediaSetlist
};
