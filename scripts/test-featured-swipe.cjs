const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const source = fs.readFileSync('assets/js/site.js', 'utf8');
const begin = source.indexOf('  function bindFeaturedSwipe(');
const end = source.indexOf('  async function renderFeatured()', begin);
assert(begin >= 0 && end > begin);

function surface(pointer = true, count = 3, width = 390) {
  const dom = new JSDOM('<div id="featured"><button id="cta">Assistir</button></div>', {runScripts:'outside-only'});
  const w = dom.window;
  w.matchMedia = () => ({matches:width <= 760});
  if (pointer) w.PointerEvent = w.Event;
  else delete w.PointerEvent;
  w.eval(source.slice(begin, end) + '\nwindow.bindSwipe = bindFeaturedSwipe;');
  const host = w.document.getElementById('featured');
  const cta = w.document.getElementById('cta');
  const changes = [];
  let index = 0, starts = 0, stops = 0, clicks = 0;
  const autoplay = {start:() => starts++, stop:() => stops++};
  const bind = () => w.bindSwipe(host, () => index, next => {
    index = (next + count) % count;
    changes.push(index);
  }, autoplay, count);
  cta.addEventListener('click', () => clicks++);
  bind();
  function emit(target, type, properties = {}) {
    const event = new w.Event(type, {bubbles:true, cancelable:true});
    for (const [key,value] of Object.entries(properties)) Object.defineProperty(event, key, {value});
    target.dispatchEvent(event);
    return event;
  }
  function gesture(x1, y1, x2, y2, extra = {}) {
    if (pointer) {
      emit(cta, 'pointerdown', {clientX:x1, clientY:y1, pointerId:1, pointerType:'touch', isPrimary:true, ...extra});
      emit(w, 'pointermove', {clientX:x2, clientY:y2, pointerId:1});
      emit(w, 'pointerup', {clientX:x2, clientY:y2, pointerId:1});
    } else {
      emit(cta, 'touchstart', {touches:[{clientX:x1, clientY:y1, identifier:1}]});
      emit(w, 'touchmove', {touches:[{clientX:x2, clientY:y2, identifier:1}]});
      emit(w, 'touchend', {changedTouches:[{clientX:x2, clientY:y2, identifier:1}]});
    }
  }
  return {w,dom,host,cta,changes,bind,emit,gesture,stats:() => ({starts,stops,clicks,index})};
}

for (const pointer of [true, false]) {
  const s = surface(pointer);
  s.gesture(250, 100, 130, 104);
  assert.deepEqual(s.changes, [1], 'left swipe advances');
  const afterSwipe = s.emit(s.cta, 'click', {detail:1});
  assert(afterSwipe.defaultPrevented);
  assert.equal(s.stats().clicks, 0, 'swiping over Assistir must not open the content');
  s.emit(s.cta, 'click', {detail:0});
  assert.equal(s.stats().clicks, 1, 'keyboard activation is retained');
  s.gesture(130, 100, 250, 104);
  assert.equal(s.stats().index, 0, 'right swipe returns');
  s.gesture(130, 100, 250, 104);
  assert.equal(s.stats().index, 2, 'right swipe wraps to the final slide');
  s.gesture(250, 100, 260, 240);
  s.gesture(250, 100, 230, 100);
  assert.equal(s.changes.length, 3, 'vertical scrolling and a short tap do not change slides');
  assert.equal(s.stats().starts, s.stats().stops, 'touch completion resumes autoplay');
  s.bind();
  s.gesture(250, 100, 130, 104);
  assert.equal(s.changes.length, 4, 'rebinding does not duplicate swipe handlers');
  s.host._beSwipeDispose();
  s.gesture(250, 100, 130, 104);
  assert.equal(s.changes.length, 4, 'disposed carousels stop handling gestures');
  s.dom.window.close();
}

for (const [pointer,count,width] of [[true,1,390],[false,1,390],[true,3,1280]]) {
  const s = surface(pointer,count,width);
  s.gesture(250,100,130,100);
  s.emit(s.cta, 'click', {detail:1});
  assert.equal(s.changes.length, 0);
  assert.equal(s.stats().clicks, 1, 'single slides and desktop retain normal clicks');
  s.dom.window.close();
}
const canceled = surface();
canceled.emit(canceled.cta, 'pointerdown', {clientX:250,clientY:100,pointerId:1,pointerType:'touch'});
canceled.emit(canceled.w, 'pointercancel', {pointerId:1});
canceled.emit(canceled.w, 'pointerup', {clientX:130,clientY:100,pointerId:1});
canceled.gesture(250,100,130,100,{pointerType:'mouse'});
assert.equal(canceled.changes.length, 0);
canceled.dom.window.close();
console.log('PASS featured swipe: both directions, wrap, vertical scroll, taps, CTA protection, keyboard, pointer/touch fallback, single slide, desktop and cleanup');
