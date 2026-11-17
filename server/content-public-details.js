'use strict';

const ROUTES = require('./content-public-page');

const LABELS = {
  'pt-br': ['Sinopse','Ficha técnica','Setlist','Ano','Duração','Tipo','Local','Cidade','País','Direção','Produção','Apresentação','Convidados'],
  'en-us': ['Synopsis','Details','Setlist','Year','Duration','Type','Venue','City','Country','Director','Production','Host','Guests'],
  es: ['Sinopsis','Ficha técnica','Setlist','Año','Duración','Tipo','Lugar','Ciudad','País','Dirección','Producción','Presentación','Invitados'],
  fr: ['Synopsis','Fiche technique','Setlist','Année','Durée','Type','Lieu','Ville','Pays','Réalisation','Production','Présentation','Invités'],
  it: ['Sinossi','Scheda tecnica','Scaletta','Anno','Durata','Tipo','Luogo','Città','Paese','Regia','Produzione','Presentazione','Ospiti']
};

function escapeHtml(value) {
  return String(value == null ? '' : value).slice(0, 16000)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function plain(value) {
  return String(value || '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_\x60#]/g, '').replace(/\s+/g, ' ').trim();
}

function renderFacts(record, localizedData, locale) {
  if (!record || record.collection === 'news') return '';
  const data = localizedData && typeof localizedData === 'object' ? localizedData : record.data || {};
  const original = record.data || {};
  const labels = LABELS[locale] || LABELS['pt-br'];
  const title = plain(data.title || data.name || original.title).slice(0, 240);
  if (!title) return '';
  const description = plain(data.description || data.synopsis || data.summary).slice(0, 4000);
  const fields = [
    [labels[3], data.year],
    [labels[4], data.duration || data.videoDuration || data.runtime],
    [labels[5], ROUTES.contentType(record)],
    [labels[6], data.venue || data.location],
    [labels[7], data.city],
    [labels[8], data.country],
    [labels[9], data.director],
    [labels[10], data.producer],
    [labels[11], data.presenter || data.host],
    [labels[12], data.guests]
  ].filter(([_, value]) => (typeof value === 'string' || typeof value === 'number') && String(value).trim());
  const songs = ROUTES.mediaSetlist(data).length ? ROUTES.mediaSetlist(data) : ROUTES.mediaSetlist(original);
  const summary = description ? '<div class="detail-seo-synopsis"><h2>' + escapeHtml(labels[0]) + '</h2><p>' + escapeHtml(description) + '</p></div>' : '';
  const technical = fields.length ? '<div class="detail-seo-technical"><h2>' + escapeHtml(labels[1]) + '</h2><dl>' + fields.map(([label,value]) =>
    '<div><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>').join('') + '</dl></div>' : '';
  const playlist = songs.length ? '<div class="detail-seo-setlist"><h2>' + escapeHtml(labels[2]) + '</h2><ol>' +
    songs.map(name => '<li>' + escapeHtml(name) + '</li>').join('') + '</ol></div>' : '';
  return '<h1 class="detail-seo-title">' + escapeHtml(title) + '</h1>' + summary + technical + playlist;
}

module.exports = { renderFacts, plain, escapeHtml };
