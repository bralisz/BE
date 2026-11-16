'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source=fs.readFileSync('assets/js/i18n.js','utf8');
const ctx={slug:'it',normalize:s=>String(s).trim()};
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('  function repairPlaceholders('),source.indexOf('  function enforceItalianCanonicalLabels(')),ctx);
const expected={'Fechar aviso':'Chiudi avviso','Atualizar página':'Aggiorna pagina','Todos os tempos':'Di sempre','Redes sociais do perfil':'Social del profilo'};
for(const [key,value] of Object.entries(expected)){
  assert.equal(ctx.normalizeImportedTranslation(key,'stale automatic translation'),value);
  assert.equal(JSON.parse(fs.readFileSync('assets/i18n/it.json'))[key],value);
}
assert.equal(ctx.normalizeImportedTranslation('Abrir perfil de {name}','Apri il profilo di {nome}'),'Apri il profilo di {name}');
assert.equal(ctx.normalizeImportedTranslation('Entrar com Discord','Accedi con Discordia'),'Accedi con Discord');
for(const lang of ['en-us','es','fr','it']){
 const file=fs.readFileSync(`assets/i18n/${lang}.json`,'utf8');
 assert.equal(file,fs.readFileSync(`_static/locales/${lang}.json`,'utf8'));
 for(const [key,value] of Object.entries(JSON.parse(file)))assert.deepEqual((key.match(/\{\w+\}/g)||[]).sort(),(value.match(/\{\w+\}/g)||[]).sort(),`${lang}: ${key}`);
}
const fr=JSON.parse(fs.readFileSync('assets/i18n/fr.json'));
assert.equal(fr['Seu perfil BETV'],'Ton profil BETV');
assert.equal(fr['Sua posição: #{position} · {time}'],'Ta position : #{position} · {time}');
for(const path of ['assets/js/site.js','development/source/core/i18n.js'])assert(fs.readFileSync(path,'utf8').includes('var REVIEWED_ITALIAN_UI='));
console.log('PASS reviewed UI: canonical corrections, stale overrides, placeholders, generated locales');
