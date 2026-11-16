'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('assets/js/account.js', 'utf8');
const saved = new Map();
const ctx = {URL, localStorage: {getItem: k => saved.get(k), setItem: (k,v) => saved.set(k,v)}};
vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('    function normalizeProfileSocialValue('), source.indexOf('    function renderProfileSocials(')), ctx);
for (const value of ['film_fan', '@film_fan', 'letterboxd.com/film_fan/', 'https://www.letterboxd.com/film_fan/?ref=profile']) {
  assert.equal(ctx.normalizeProfileSocialValue('letterboxd',value), 'film_fan');
  assert.equal(ctx.profileSocialHref('letterboxd',value), 'https://letterboxd.com/film_fan/');
}
for (const value of ['', 'a', 'abcdefghijklmnop', 'fan.name', 'film-fan', 'javascript:alert(1)', 'https://letterboxd.com.evil.test/fan/', 'https://evil.test/fan/', 'https://user:password@letterboxd.com/fan/', 'https://letterboxd.com/film/title/']) {
  assert.equal(ctx.normalizeProfileSocialValue('letterboxd',value), '', value);
}
ctx.writeProfileSocialLinks('test', {x:'billieeilish',instagram:'billieeilish',tiktok:'billieeilish',letterboxd:'film_fan'});
assert.equal(ctx.readProfileSocialLinks('test').letterboxd, 'film_fan');
assert(ctx.hasProfileSocialLinks({letterboxd:'film_fan'}));
assert.equal(ctx.readProfileSocialLinks('test').instagram, 'billieeilish');
ctx.writeProfileSocialLinks('test', {letterboxd:''});
assert.equal(ctx.readProfileSocialLinks('test').letterboxd, '');
assert(ctx.profileSocialIcon('letterboxd').includes('<svg'));
// The public endpoint must preserve the new field returned by the profile RPC.
global.fetch = async url => ({ok:true,json:async()=>url.includes('get_profile_follow_state') ? [] : [{username:'testuser',social_links:{letterboxd:'film_fan',instagram:'billieeilish'}}]});
const api = require('../server/api-routes/public-profile.js');
api.fetchPublicProfile('testuser').then(profile=>{
  assert.equal(profile.socialLinks.letterboxd,'film_fan');
  assert.equal(profile.socialLinks.instagram,'billieeilish');
  console.log('PASS Letterboxd: handles, URLs, rejected hosts, storage, removal, public profile');
}).catch(error=>{console.error(error);process.exitCode=1;});
