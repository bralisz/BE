import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname } from 'node:path';
import { transform } from 'esbuild';

const out = '_static';

await rm(out, { recursive: true, force: true });

const copies = [
  ['assets/js/locale-routing.js', `${out}/chunks/locale.js`],
  ['assets/js/site.js', `${out}/chunks/site.js`],
  ['assets/js/tv-controller.js', `${out}/chunks/tv.js`],
  ['assets/js/tv-session-widget.js', `${out}/chunks/session.js`],
  ['assets/js/lazy-loading.js', `${out}/chunks/lazy.js`],
  ['assets/css/site.css', `${out}/styles/site.css`],
  ['assets/css/tv-pairing.css', `${out}/styles/tv.css`],
];

async function buildTextAsset(src, dest) {
  const extension = extname(src).toLowerCase();
  const loader = extension === '.css' ? 'css' : 'js';
  const source = await readFile(src, 'utf8');
  const result = await transform(source, {
    loader,
    charset: 'utf8',
    legalComments: 'none',
    minifyWhitespace: true,
    minifySyntax: true,
    // Mantem nomes/identificadores para reduzir o risco em um bundle legado
    // que ainda possui integracoes por eventos e propriedades globais.
    minifyIdentifiers: false,
    target: loader === 'js' ? 'es2020' : undefined,
  });
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, result.code, 'utf8');
}

for (const [src, dest] of copies) {
  await buildTextAsset(src, dest);
}

await mkdir(`${out}/locales`, { recursive: true });
for (const lang of ['en-us', 'es', 'fr', 'it']) {
  const source = JSON.parse(await readFile(`assets/i18n/${lang}.json`, 'utf8'));
  await writeFile(`${out}/locales/${lang}.json`, JSON.stringify(source), 'utf8');
}

await mkdir(`${out}/media/icons`, { recursive: true });
await cp('assets/images', `${out}/media`, { recursive: true });
await cp('assets/icons', `${out}/media/icons`, { recursive: true });
