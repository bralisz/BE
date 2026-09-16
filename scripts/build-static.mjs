import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
const out = '_static';
await rm(out, { recursive: true, force: true });
const copies = [
  ['assets/js/locale-routing.js', out + '/chunks/locale.js'],
  ['assets/js/site.js', out + '/chunks/site.js'],
  ['assets/js/tv-controller.js', out + '/chunks/tv.js'],
  ['assets/js/tv-session-widget.js', out + '/chunks/session.js'],
  ['assets/js/lazy-loading.js', out + '/chunks/lazy.js'],
  ['assets/css/site.css', out + '/styles/site.css'],
  ['assets/css/tv-pairing.css', out + '/styles/tv.css']
];
for (const pair of copies) { await mkdir(dirname(pair[1]), { recursive: true }); await cp(pair[0], pair[1]); }
const sitePath = out + '/chunks/site.js';
let site = await readFile(sitePath, 'utf8');
site = site.replace(/function followingStorageKey\(userId\)\{return 'beFollowingUsers:'[^}]+\}\s*function readFollowingUsers\(userId\)\{[^}]+\}\s*function writeFollowingUsers\(userId,value\)\{[^}]+\}/, "function followingStorageKey(){return ''} function readFollowingUsers(){return []} function writeFollowingUsers(userId,value){return normalizeFollowingUsernames(value)}");
site = site.replace(/function isFollowingViewedProfile\(\)\{[^}]+\}/, "function isFollowingViewedProfile(){return false}");
site = site.replace(/async function toggleProfileFollow\(\)\{[\s\S]*?\n    function relationshipItemMarkup/, "async function toggleProfileFollow(){return;}\n    function relationshipItemMarkup");
const canonical = await readFile('assets/js/profile-relationships-canonical.js', 'utf8');
const followRpc = await readFile('assets/js/profile-follow-rpc.js', 'utf8');
await writeFile(sitePath, site + '\n' + canonical + '\n' + followRpc, 'utf8');
await mkdir(out + '/locales', { recursive: true });
for (const lang of ['en-us', 'es', 'fr', 'it']) await cp('assets/i18n/' + lang + '.json', out + '/locales/' + lang + '.json');
await mkdir(out + '/media/icons', { recursive: true });
await cp('assets/images', out + '/media', { recursive: true });
await cp('assets/icons', out + '/media/icons', { recursive: true });
