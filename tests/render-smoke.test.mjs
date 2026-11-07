// Template/event smoke checks in Node. These do not replace visual browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultDraft,quote} from '../model.js?v=combined-10';
import * as workflow from '../workflow-model.js?v=combined-10';
let bootId=0;
const RealDate=Date;
async function boot(url,bookings=[],work={}){
 const names=['document','window','location','history','localStorage','sessionStorage','navigator','Date'];
 const saved=new Map(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const events={},root={innerHTML:''},announcement={textContent:''},storage=new Map([['business-hq-prototype-v1',JSON.stringify(bookings)],['business-hq-workflows-v3',JSON.stringify(work)]]),session=new Map();
 const store=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)});
 const values={document:{activeElement:null,querySelector:s=>s==='#app'?root:s==='#announcement'?announcement:s==='#main'?{focus(){}}:null,addEventListener:(name,fn)=>{(events[name]??=[]).push(fn);},getElementById:()=>null,querySelectorAll:()=>[]},window:{innerWidth:1024,addEventListener(){},scrollTo(){}},location:new URL(url),history:{replaceState(_a,_b,next){globalThis.location=new URL(next,globalThis.location);}},localStorage:store(storage),sessionStorage:store(session),navigator:{},Date:class extends RealDate{constructor(...args){super(...(args.length?args:['2026-11-06T18:00:00Z']));}static now(){return RealDate.parse('2026-11-06T18:00:00Z');}}};
 for(const name of names)Object.defineProperty(globalThis,name,{value:values[name],writable:true,configurable:true});
 try{await import('../app.js?render-smoke='+ ++bootId);}catch(err){for(const [name,d]of saved)d?Object.defineProperty(globalThis,name,d):delete globalThis[name];throw err;}
 return {root,storage,async click(action,id){for(const handler of events.click??[])await handler({target:{closest:()=>({dataset:{action,id}})},preventDefault(){}});},async recent(id,checked){for(const handler of events.change??[])await handler({target:{dataset:{recent:id},checked}});},restore(){for(const [name,d]of saved)d?Object.defineProperty(globalThis,name,d):delete globalThis[name];}};
}
test('combined customer home renders sharing, hours, recent services, and both promotion prices',async()=>{
 const page=await boot('https://example.test/?view=customer');try{assert.match(page.root.innerHTML,/Share Joe’s booking page/);assert.match(page.root.innerHTML,/Show opening hours/);assert.match(page.root.innerHTML,/Recently ordered/);assert.match(page.root.innerHTML,/From \$127\.50/);assert.match(page.root.innerHTML,/15% off/);assert.match(page.root.innerHTML,/10% off/);await page.click('hours');assert.match(page.root.innerHTML,/<h2 id="dialog-title">Hours<\/h2>/);assert.match(page.root.innerHTML,/Eastern Time/);}finally{page.restore();}
});
test('selecting another recent service opens its questions before scheduling',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('gutters',true);assert.match(page.root.innerHTML,/2 selected/);await page.click('rebook-selected');assert.match(page.root.innerHTML,/Let’s plan your visit/);assert.match(page.root.innerHTML,/Are gutter guards fitted/);}finally{page.restore();}
});
test('same-service quick rebooking uses current pricing and shows the schedule',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.click('rebook-selected');assert.match(page.root.innerHTML,/Find your Thursday/);assert.match(page.root.innerHTML,/\$239\.25/);}finally{page.restore();}
});
test('owner sample still renders the field desk with Help and all four navigation areas',async()=>{
 const page=await boot('https://example.test/?view=owner&sample=1');try{for(const label of ['My day','Schedule','To do','My business','Field desk help','Load up once.'])assert.ok(page.root.innerHTML.includes(label));assert.match(page.root.innerHTML,/\$331\.50/);await page.click('hq-help');assert.match(page.root.innerHTML,/A simpler working day/);}finally{page.restore();}
});
test('loading and progressing legacy jobs preserves their agreed price and original promotion policy',async()=>{
 const d={...defaultDraft(),size:'small',start:795,accessConfirmed:true};delete d.promotionSnapshot;const b={id:'JHQ-OLD00123',draft:d,...quote(d),status:'confirmed'};
 const page=await boot('https://example.test/?view=owner',[b]);try{assert.match(page.root.innerHTML,/\$198/);await page.click('hq-job',b.id);await page.click('hq-way',b.id);await page.click('hq-start',b.id);assert.match(page.root.innerHTML,/In progress/);const stored=JSON.parse(page.storage.get('business-hq-prototype-v1'))[0];assert.equal(stored.total,198);assert.equal(stored.draft.promotionSnapshot.name,'October gutter special');}finally{page.restore();}
});

test('unchecking all recent services disables rebooking and cannot create an empty visit',async()=>{
 const page=await boot('https://example.test/?view=customer');try{await page.recent('leaves',false);assert.match(page.root.innerHTML,/data-action="rebook-selected" disabled/);await page.click('rebook-selected');assert.match(page.root.innerHTML,/Hi Mary, how can we help today/);}finally{page.restore();}
});
test('accepted fixed quotes render the exact total with no misleading automatic discount rows',async()=>{
 let work=workflow.requestQuote(workflow.freshWork(),{...defaultDraft(),services:['gutters'],stories:3});const id=work.quotes[0].id;work=workflow.offerQuote(work,id,220,120,'Includes the reviewed scope and travel.');
 const page=await boot('https://example.test/?view=customer',[],work);try{await page.click('wf-accept-quote',id);assert.match(page.root.innerHTML,/Owner-approved quote/);assert.match(page.root.innerHTML,/\$220/);assert.ok(!page.root.innerHTML.includes('class="bill-line discount"'));}finally{page.restore();}
});
