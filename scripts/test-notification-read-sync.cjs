'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

const source=fs.readFileSync('assets/js/site.js','utf8');
const served=fs.readFileSync('_static/chunks/site.js','utf8');
assert.equal(source,served,'the served site must mirror the account-read implementation');
const start=source.indexOf('  var readServerState=Object.create(null);');
const end=source.indexOf('  function itemTimestamp(',start);
assert(start>=0&&end>start,'read synchronization implementation must exist');
const helpers=source.slice(start,end);
const initialize=new Function(
  'window','localStorage','notifications','renderPreviews','notifyReadStateChanged',
  'itemTimestamp','READ_STATE_KEY','STORAGE_KEY',
  helpers+'\nreturn {readState,migrateLegacyReadState,syncNotificationReads,writeRemoteReads,notificationUserId};'
);
const USER_A='11111111-1111-4111-8111-111111111111';
const USER_B='22222222-2222-4222-8222-222222222222';
const NOTICE_A='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const NOTICE_B='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function storage(initial){
  const values=new Map(initial||[]);
  return {
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>values.set(key,String(value)),
    removeItem:key=>values.delete(key)
  };
}
const remote=new Map([
  [USER_A,[{notification_id:NOTICE_A,read_through:1800000000000}]],
  [USER_B,[]]
]);
let current=USER_A;
const writes=[];
const client={
  from(table){
    assert.equal(table,'notification_reads');
    return {select(){
      return {eq(key,uid){
        assert.equal(key,'user_id');
        return {limit:async()=>({data:(remote.get(uid)||[]).map(row=>({...row})),error:null})};
      }};
    }};
  },
  async rpc(name,args){
    assert.equal(name,'mark_my_notifications_read');
    assert.equal(args.p_expected_user_id,current,'receipt must target the active account');
    writes.push(args);
    const list=remote.get(current)||[];
    for(const receipt of args.p_receipts){
      const existing=list.find(row=>row.notification_id===receipt.id);
      if(existing)existing.read_through=Math.max(existing.read_through,receipt.through);
      else list.push({notification_id:receipt.id,read_through:receipt.through});
    }
    remote.set(current,list);
    return {data:args.p_receipts.length,error:null};
  }
};
const window={beBackend:{auth:{currentUser:{uid:USER_A}},client,ready:Promise.resolve()}};
const notices=[
  {id:NOTICE_A,updatedAt:'2026-11-01T00:00:00Z'},
  {id:NOTICE_B,updatedAt:'2026-11-02T00:00:00Z'}
];
const local=storage([
  ['beNotificationsReadStateV2',JSON.stringify({[NOTICE_B]:1750000000000})]
]);
const mount=(localStorage)=>initialize(
  window,localStorage,notices,()=>{},()=>{},
  item=>Date.parse(item.updatedAt),
  'beNotificationsReadStateV2','beNotificationsLastSeen'
);
(async()=>{
  const sync=mount(local);
  sync.migrateLegacyReadState(USER_A);
  await sync.syncNotificationReads(false);
  assert.equal(sync.readState()[NOTICE_A],1800000000000,'existing cloud read remains read');
  assert.equal(sync.readState()[NOTICE_B],1750000000000,'legacy local read imported for first account');
  assert(remote.get(USER_A).some(row=>row.notification_id===NOTICE_B),'legacy reads uploaded once');

  window.beBackend.auth.currentUser={uid:USER_B};current=USER_B;
  assert.equal(Object.keys(sync.readState()).length,0,'second account must never inherit first account reads');
  sync.migrateLegacyReadState(USER_B);
  await sync.syncNotificationReads(false);
  assert.equal(Object.keys(sync.readState()).length,0);
  await sync.writeRemoteReads(USER_B,[{id:NOTICE_A,through:1900000000000}]);

  // Simulate a second device with completely fresh browser storage.
  const secondDevice=mount(storage());
  await secondDevice.syncNotificationReads(false);
  assert.equal(secondDevice.readState()[NOTICE_A],1900000000000,'new device must inherit read status');
  assert.equal(secondDevice.readState()[NOTICE_B],undefined,'other account legacy state remains private');
  assert(writes.every(entry=>entry.p_expected_user_id===USER_A||entry.p_expected_user_id===USER_B));
  console.log('PASS account notification read sync, cross-device status, legacy import and account isolation');
})().catch(error=>{console.error(error);process.exitCode=1;});
