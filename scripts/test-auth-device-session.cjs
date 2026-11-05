'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function harness(path) {
  const source = fs.readFileSync(path, 'utf8');
  const stored = new Map(), timers = [], saved = [], errors = [];
  let subscription, signOuts = 0;
  const now = Date.now(), stamp = offset => new Date(now + offset).toISOString();
  const storage = { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
  const normalize = value => ({ detailFavorites: [], featuredFavorites: [], savedContents: [], profileTopFavorites: [], profileLovedAlbums: [], followingUsers: [], accountDevices: [], ...JSON.parse(JSON.stringify(value || {})) });
  const ctx = {
    Date, Promise, JSON, String, Boolean,
    auth: { currentUser: { uid: 'user', raw: { last_sign_in_at: stamp(0) } }, signOut: async () => { signOuts++; ctx.auth.currentUser = null; } },
    localStorage: storage, sessionStorage: storage,
    window: { setTimeout: fn => timers.push(fn), dispatchEvent() {} },
    document: { body: { classList: { contains: () => false } } },
    normalizeCrossDeviceData: normalize,
    accountDeviceId: () => 'browser',
    readStorageJson: (key, fallback) => stored.has(key) ? JSON.parse(stored.get(key)) : fallback,
    syncedUserCacheKey: id => 'cache:' + id,
    profileSocialStorageKey: id => 'social:' + id,
    profileColorStorageKey: (id, kind) => kind + ':' + id,
    pendingProfileColorSync: null, applyingRemotePreferences: false, currentProfile: {}, viewedProfile: null,
    applyOwnAvatarBorder() {}, writeTvDeviceBrands() {}, showLogin() {}, setMode() {},
    preferenceSyncUserId: '', preferenceSyncStarting: false, preferenceDeviceSyncStop: null,
    stopCrossDeviceSync() { ctx.preferenceSyncUserId = ''; ctx.preferenceSyncStarting = false; ctx.preferenceDeviceSyncStop = null; },
    refreshAccountDeviceIdentity: async () => {},
    setSettingsSyncStatus: (state, message) => { if (state === 'error') errors.push(message); },
    localCrossDeviceSeed: () => normalize({}), mergeTvDeviceBrands: (a, b) => ({ ...a, ...b }),
    mergeAccountDevices: (a, b) => a.concat(b),
    readAccountDevices: id => JSON.parse(stored.get('devices:' + id) || '[]'),
    writeAccountDevices: (id, devices) => { stored.set('devices:' + id, JSON.stringify(devices)); return devices; },
    ensureCurrentAccountDevice: (id, devices) => ctx.writeAccountDevices(id, [{ id: 'browser', active: true, lastSeen: stamp(1000), disconnectedAt: '' }, ...devices.filter(d => d.id !== 'browser')]),
    beBackend: { now: () => stamp(1000), preferences: {
      get: async () => ({ data: ctx.remote }),
      save: async (id, data) => { saved.push(data); return { data }; },
      subscribe: (id, callback) => { subscription = callback; return () => {}; }
    } }
  };
  vm.createContext(ctx);
  for (const [start, end] of [
    ['    function accountDeviceDisconnectApplies(', '    function normalizeTvDeviceBrands('],
    ['    function applyCrossDeviceData(', '    async function persistCrossDeviceData('],
    ['    async function startCrossDeviceSync(', '    function closeOnboarding(']
  ]) vm.runInContext(source.slice(source.indexOf(start), source.indexOf(end)), ctx);
  const record = offset => normalize({ accountDevices: [{ id: 'browser', active: false, disconnectedAt: stamp(offset) }], detailFavorites: ['keep-favorite'] });
  return { ctx, stamp, record, saved, errors, timers, stored, signOuts: () => signOuts, emit: data => subscription({ data }), drain: async () => { while (timers.length) await timers.shift()(); await Promise.resolve(); } };
}

(async () => {
  for (const path of ['assets/js/account.js', '_static/chunks/account.js']) {
    // An old remote disconnect must not revoke a new password or OAuth login,
    // even before the password handler sets its one-shot fresh-login flag.
    for (const provider of ['email', 'discord']) {
      const h = harness(path); h.ctx.auth.currentUser.raw.app_metadata = { provider };
      h.ctx.remote = h.record(-60000);
      await h.ctx.startCrossDeviceSync(h.ctx.auth.currentUser);
      await h.drain();
      assert.deepEqual(h.errors, []);
      assert.equal(h.saved.length, 1);
      assert.equal(h.saved[0].accountDevices[0].active, true);
      assert.equal(h.signOuts(), 0);
      // A delayed cache/realtime replay after the login flag has been consumed.
      h.emit(h.record(-60000)); await h.drain();
      assert.equal(h.signOuts(), 0);
      assert.equal(h.ctx.readAccountDevices('user')[0].active, true);
      assert.equal(h.stored.get('beDetailFavorites'), '["keep-favorite"]');
      // A genuine later disconnect must still sign this session out.
      h.emit(h.record(1000)); await h.drain();
      assert.equal(h.signOuts(), 1);
    }
    // Reloading a session that really was disconnected still signs out.
    const revoked = harness(path); revoked.ctx.remote = revoked.record(1000);
    revoked.stored.set('beFreshAccountLogin', '1');
    await revoked.ctx.startCrossDeviceSync(revoked.ctx.auth.currentUser); await revoked.drain();
    assert.equal(revoked.signOuts(), 1);
    assert.equal(revoked.saved.length, 0);
    // A queued callback cannot log out a newer login or another account.
    for (const accountSwitch of [false, true]) {
      const race = harness(path);
      race.ctx.applyCrossDeviceData(race.record(1000), 'user', 'remote');
      race.ctx.auth.currentUser = { uid: accountSwitch ? 'other' : 'user', raw: { last_sign_in_at: race.stamp(2000) } };
      await race.drain(); assert.equal(race.signOuts(), 0);
    }
    const legacy = harness(path);
    assert.equal(legacy.ctx.accountDeviceDisconnectApplies({ active: false }, { uid: 'user' }), true);
    assert.equal(legacy.ctx.accountDeviceDisconnectApplies({ active: true }, { uid: 'user' }), false);
    console.log('PASS ' + path + ': login, stale replay, preferences, remote disconnect, reload and queued-login races');
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
