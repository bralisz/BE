'use strict';
const assert=require('node:assert/strict');
const sharp=require('sharp');
const handler=require('../server/handlers/media');
(async()=>{
  const source=await sharp({create:{width:1200,height:800,channels:3,background:'#6d94b6'}}).webp().toBuffer();
  const originalFetch=global.fetch;
  global.fetch=async()=>({status:200,ok:true,headers:{get:key=>key==='content-type'?'image/webp':key==='content-length'?String(source.length):null},arrayBuffer:async()=>source});
  try{
    let output,status;const headers={};
    const response={setHeader:(key,value)=>headers[key]=value,status(code){status=code;return this;},send(value){output=value;return this;},end(){}};
    await handler({method:'GET',headers:{},query:{u:Buffer.from('https://i.pinimg.com/test.webp').toString('base64url'),w:'320',q:'65'}},response);
    assert.equal(status,200);assert.equal(headers['Content-Type'],'image/webp');
    assert.equal((await sharp(output).metadata()).width,320);
    assert.match(headers['Cache-Control'],/immutable/);
    console.log('PASS media: actual WebP resize and cache headers');
  }finally{global.fetch=originalFetch;}
})().catch(error=>{console.error(error);process.exit(1);});
