'use strict';
// Static regression coverage for Watch Party, gift entitlements, profile privacy and build publishing.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const read = path => fs.readFileSync(path,'utf8');
for(const [source,published] of [
 ['assets/js/features.js','_static/chunks/features.js'],
 ['assets/js/account.js','_static/chunks/account.js'],
 ['assets/js/community.js','_static/chunks/community.js'],
 ['assets/js/watch-party-paywall.js','_static/chunks/watch-party-paywall.js'],
 ['assets/js/watch-party-gift.js','_static/chunks/watch-party-gift.js'],
 ['assets/js/profile-activity.js','_static/chunks/profile-activity.js']
]){
 const a=read(source),b=read(published);
 assert.equal(b,a,`${published} must match ${source}`);
 new vm.Script(a,{filename:source});
}
const html=read('index.html');
const features=read('assets/js/features.js');
const paywall=read('assets/js/watch-party-paywall.js');
const gift=read('assets/js/watch-party-gift.js');
const watchParty=read('assets/js/watch-party.js');
const activity=read('assets/js/profile-activity.js');
const checkout=read('supabase/functions/watch-party-checkout/index.ts');
const styles=read('assets/css/watch-party-paywall.css');
const builder=read('scripts/build-static.mjs');
const migration=read('supabase/migrations/20261101004000_profile_watch_activity_privacy.sql');
assert.match(features,/20261101-account-privacy-language-v2/);
assert.match(features,/20261101-community-ranking-settings-v2/);
assert.match(html,/profile-activity.js\?rev=20261101-profile-activity-v2/);
assert.match(builder,/assets\/js\/profile-activity.js/);
assert.match(builder,/assets\/css\/profile-activity.css/);
assert.match(paywall,/watchPartyUnlockPix/);
assert.match(paywall,/paymentMethod:method/);
assert.match(checkout,/payment_status!=="paid"/);
assert.match(checkout,/pending:true/);
assert.match(gift,/watch_party_recipient_available/);
assert.match(gift,/my_watch_party_gift_status/);
assert.match(watchParty,/id="watchPartyGiftOpen"/);
assert.match(watchParty,/BETVWatchPartyPaywall\?\.canGift/);
assert.match(migration,/row level security/);
assert.match(activity,/set_profile_watch_visibility/);
assert.match(activity,/get_public_last_watch/);
assert.match(activity,/record_profile_watch/);
assert.match(styles,/#contentDetailWatchParty\{order:0\}/);
assert.match(styles,/#contentDetailList\{order:2\}/);
assert.match(read('assets/js/watch-party.js'),/respond_watch_party_gift/);
assert.match(read('assets/js/watch-party.js'),/watch_party_gift_requests/);
assert.match(read('supabase/functions/watch-party-pix/index.ts'),/watch_party_unlocks/);
assert.match(read('assets/js/watch-party-paywall.js'),/startPix/);
assert.match(read('assets/js/watch-party-paywall.js'),/watchPartyPixCode/);
assert.match(read('supabase/functions/watch-party-pix/index.ts'),/notification_url/);
assert.match(read('supabase/functions/watch-party-pix-webhook/index.ts'),/stripe_session_id:"mp:"/);
assert.match(read('development/source/admin/admin.js'),/const siteRoutes = \['sections','settings'\]/);
assert.doesNotMatch(read('development/source/admin/workspace.js'),/\['ongs', 'Apoie uma ONG', 'Site'\]/);
assert.ok(!html.includes('id="donatePage"'));
assert.match(html,/data-public-action="fans"/);
console.log('BETV Watch Party, profile privacy, lazy-load cache and build checks passed.');
