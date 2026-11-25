'use strict';

const LOCALES = Object.freeze([
  Object.freeze({ slug: 'pt-br', hreflang: 'pt-BR' }),
  Object.freeze({ slug: 'en-us', hreflang: 'en-US' }),
  Object.freeze({ slug: 'es', hreflang: 'es' }),
  Object.freeze({ slug: 'es-419', hreflang: 'es-419' }),
  Object.freeze({ slug: 'fr', hreflang: 'fr' }),
  Object.freeze({ slug: 'it', hreflang: 'it' })
]);

const LOCALIZED_ROUTE_SLUGS = Object.freeze({
  'pt-br': Object.freeze({ '/comunidade': '/comunidade', '/fãs': '/fãs' }),
  'en-us': Object.freeze({ '/comunidade': '/community', '/fãs': '/fans' }),
  'es-419': Object.freeze({ '/comunidade': '/comunidad', '/fãs': '/fans' }),
  es: Object.freeze({ '/comunidade': '/comunidad', '/fãs': '/fans' }),
  fr: Object.freeze({ '/comunidade': '/communaute', '/fãs': '/fans' }),
  it: Object.freeze({ '/comunidade': '/comunita', '/fãs': '/fans' })
});

function languageLinks(urlForLocale) {
  return [
    ...LOCALES.map(({ slug, hreflang }) => [hreflang, urlForLocale(slug)]),
    ['pt', urlForLocale('pt-br')],
    ['en', urlForLocale('en-us')],
    ['x-default', urlForLocale('pt-br')]
  ];
}

module.exports = { LOCALES, LOCALIZED_ROUTE_SLUGS, languageLinks };
