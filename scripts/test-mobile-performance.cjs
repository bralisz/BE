const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function surface(io=true) {
  const rootClasses = new Set();
  const docEvents = new Map(), events = new Map(), jobs = new Map();
  const document = {hidden:false,documentElement:{classList:{contains:name=>rootClasses.has(name),toggle(name,on){on?rootClasses.add(name):rootClasses.delete(name);}}},addEventListener:(name,fn)=>docEvents.set(name,fn)};
  let observer, next=0;
  const window = {addEventListener:(name,fn)=>events.set(name,fn)};
  const sandbox = {window,document,Map,setInterval:fn=>{jobs.set(++next,fn);return next;},clearInterval:id=>jobs.delete(id)};
  if(io) sandbox.IntersectionObserver=window.IntersectionObserver=class {constructor(cb){this.cb=cb;observer=this;}observe(){}unobserve(){}};
  vm.runInNewContext(fs.readFileSync('assets/js/performance.js','utf8'),sandbox);
  return {window,document,jobs,rootClasses,events,docEvents,visible(host,on){observer.cb([{target:host,isIntersecting:on}]);}};
}
for(const io of [true,false]) {
  const s=surface(io),host={isConnected:true};let steps=0;
  let ctrl=s.window.BETVAutoplay(host,()=>steps++,10000);
  if(io){assert.equal(s.jobs.size,0);s.visible(host,true);}
  assert.equal(s.jobs.size,1);s.jobs.forEach(fn=>fn());assert.equal(steps,1);
  if(io){s.visible(host,false);assert.equal(s.jobs.size,0);s.visible(host,true);}
  s.document.hidden=true;s.docEvents.get('visibilitychange')();assert.equal(s.jobs.size,0);
  s.document.hidden=false;s.docEvents.get('visibilitychange')();assert.equal(s.jobs.size,1);
  s.rootClasses.add('performance-lite');s.events.get('be:performance-change')();ctrl.start();assert.equal(s.jobs.size,0);
  s.rootClasses.delete('performance-lite');s.events.get('be:performance-change')();assert.equal(s.jobs.size,1);
  ctrl=s.window.BETVAutoplay(host,()=>steps++,10000);if(io)s.visible(host,true);
  assert.equal(s.jobs.size,1);ctrl.stop();assert.equal(s.jobs.size,0);ctrl.start();assert.equal(s.jobs.size,1);
  host.isConnected=false;s.jobs.forEach(fn=>fn());assert.equal(s.jobs.size,0);
}
const html=fs.readFileSync('index.html','utf8');
const at=html.indexOf('var mobileQuery');
const policy=html.slice(html.lastIndexOf('<script>',at)+8,html.indexOf('</script>',at));
for(const d of [{memory:2,cores:4,lite:true},{memory:8,cores:8,lite:false},{memory:0,cores:0,lite:false},{memory:8,cores:8,save:true,lite:true},{memory:8,cores:8,network:'2g',lite:true}]) {
 const s=surface();const mobile={matches:true,addEventListener(){}},motion={matches:false,addEventListener(){}};
 s.window.matchMedia=query=>query.includes('max-width')?mobile:motion;s.window.dispatchEvent=()=>{};
 vm.runInNewContext(policy,{window:s.window,document:s.document,navigator:{deviceMemory:d.memory,hardwareConcurrency:d.cores,connection:{saveData:!!d.save,effectiveType:d.network||'4g'}},Event:class{}});
 assert.equal(s.rootClasses.has('performance-lite'),d.lite);assert.equal(s.rootClasses.has('mobile-lite'),d.lite);
}
assert.equal(fs.readFileSync('_static/chunks/performance.js','utf8'),fs.readFileSync('assets/js/performance.js','utf8'));
assert.equal(fs.readFileSync('_static/chunks/site.js','utf8'),fs.readFileSync('assets/js/site.js','utf8'));
assert.equal(fs.readFileSync('_static/chunks/lazy.js','utf8'),fs.readFileSync('assets/js/lazy-loading.js','utf8'));
console.log('PASS autoplay: offscreen/background/lite/resume/rerender/disconnect and observer fallback; device/network policy; published JS parity');
