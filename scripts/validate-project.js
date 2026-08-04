'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
const releaseFolder = `atualizacoes/v${version}`;
const required = [
  'README.md',
  'VERSION',
  'CHANGELOG.md',
  'index.html',
  '404.html',
  'vercel.json',
  'site.webmanifest',
  'config/site.js',
  'assets/css/site.css',
  'assets/js/site.js',
  'assets/js/lazy-loading.js',
  'assets/images/brand/logo.png',
  'api/site-page.js',
  'atualizacoes/README.md',
  `${releaseFolder}/atualizacao.txt`,
  `${releaseFolder}/release.txt`,
  `${releaseFolder}/lista-de-arquivos.txt`
];

let failed = false;
for (const relative of required) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) {
    console.error(`Arquivo obrigatório ausente: ${relative}`);
    failed = true;
  }
}

for (const relative of ['vercel.json', 'site.webmanifest']) {
  try {
    JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
  } catch (error) {
    console.error(`JSON inválido em ${relative}: ${error.message}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log(`Estrutura essencial da v${version} validada com sucesso.`);
