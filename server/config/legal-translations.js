'use strict';

// Reutiliza os mesmos dicionários carregados pelo navegador. Isso mantém a
// tradução produzida pelo servidor idêntica à configuração atual do site.
const EN_US = require('../../assets/i18n/en-us.json');
const ES = require('../../assets/i18n/es.json');
const FR = require('../../assets/i18n/fr.json');
const IT = require('../../assets/i18n/it.json');

module.exports = Object.freeze({
  'pt-br': Object.freeze({}),
  'en-us': Object.freeze(EN_US),
  es: Object.freeze(ES),
  fr: Object.freeze(FR),
  it: Object.freeze(IT)
});
