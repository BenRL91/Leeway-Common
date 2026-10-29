import {Fault,json,principal,boundedBody,verifyProducer,digest} from './security.mjs';
import {normalizeEvent,TYPES} from './contracts.mjs';
import {Store} from './store.mjs';
import {accessChecker,destination} from './access.mjs';
function parse(raw){try{return JSON.parse(raw);}catch{throw new Fault('INVALID_JSON');}}
function cursorDecode(raw){if(!raw)return null;try{const c=JSON.parse(atob(raw));if(typeof c.key!=='string'||c.key.length>180||typeof c.receivedAt!=='string'||!Number.isFinite(Date.parse(c.receivedAt)))throw Error();return c;}catch{throw new Fault('INVALID_CURSOR');}}
const cursorEncode=row=>btoa(JSON.stringify({key:row.key,receivedAt:row.received_at}));
function safe(e){return {id:e.key,app:e.app==='demo'?'replay':e.app,title:TYPES[e.type],type:e.type,createdAt:e.occurred_at,read:!!e.read_at,version:e.read_version||0,target:{...e.target},destination:destination(e)};}
async function mapLimited(rows,check){const values=new Array(rows.length);let n=0;await Promise.all(Array.from({length:Math.min(6,rows.length)},async()=>{while(n<rows.length){const i=n++;values[i]=await check(rows[i]);}}));return rows.filter((r,i)=>values[i]);}
export async function userApi(request,env,p,prefix='/v1'){const u=new URL(request.url);const store=new Store(env.DB),check=accessChecker(env,p,store);const path=u.pathname.slice(prefix.length);
 if(path==='/inbox'&&request.method==='GET'){
  const after=cursorDecode(u.searchParams.get('cursor'));let scanned=0,cursor=null;const all=[];
  do{const page=await store.page(p,cursor);const rows=page.slice(0,100);scanned+=rows.length;if(scanned>1000)throw new Fault('INBOX_SCAN_LIMIT',503);all.push(...await mapLimited(rows,check));cursor=page.length>100?{key:rows.at(-1).key,receivedAt:rows.at(-1).received_at}:null;}while(cursor);
  const matching=after?all.filter(e=>e.received_at<after.receivedAt||e.received_at===after.receivedAt&&e.key<after.key):all;
  const page=matching.slice(0,25);return json({contract:'leewaypb.notifications.inbox',version:1,items:page.map(safe),unreadCount:all.filter(e=>!e.read_at).length,nextCursor:matching.length>25?cursorEncode(page.at(-1)):null,preferences:await store.preference(p)});
 }
 if(path==='/preferences'){
  if(request.method==='GET')return json(await store.preference(p));
  if(request.method==='PUT'){const i=parse(await boundedBody(request));if(Object.keys(i).some(k=>!['inApp','version'].includes(k))||typeof i.inApp!=='boolean'||!Number.isSafeInteger(i.version)||i.version<0)throw new Fault('INVALID_PREFERENCES');return json(await store.setPreference(p,i));}
 }
 const match=/^\/notifications\/([^/]+)\/(read|open)$/.exec(path);
 if(match){const key=decodeURIComponent(match[1]);if(key.length>180)throw new Fault('NOT_FOUND',404);const e=await store.owned(p,key);if(!e||!await check(e))throw new Fault('NOT_FOUND',404);
  if(match[2]==='open'&&request.method==='GET')return json({destination:destination(e),target:{...e.target}});
  if(match[2]==='read'&&request.method==='PUT'){const i=parse(await boundedBody(request));if(Object.keys(i).some(k=>!['read','version'].includes(k))||typeof i.read!=='boolean'||!Number.isSafeInteger(i.version)||i.version<0)throw new Fault('INVALID_READ_STATE');return json(await store.read(p,key,i.read,i.version));}
 }
 throw new Fault('NOT_FOUND',404);
}
export async function api(request,env){const u=new URL(request.url);if(u.pathname==='/v1/events'&&request.method==='POST'){
 if(request.headers.get('Content-Type')?.split(';')[0]!=='application/json')throw new Fault('JSON_REQUIRED',415);
 const raw=await boundedBody(request);const app=await verifyProducer(request,env,raw);const e=await normalizeEvent(parse(raw),app);return json(await new Store(env.DB).ingest(e));
 }
 const p=await principal(request,env);return userApi(request,env,p);
}
export async function demoPrincipal(request,env){
 const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase();
 if(!id||!env.DEMO_OWNER_EMAIL||email!==env.DEMO_OWNER_EMAIL.trim().toLowerCase())throw new Fault('OWNER_ONLY',403);
 const subject='demo:'+await digest(id);return {subject,keys:['sub:'+subject],demo:true};
}
export async function seedDemo(env,p){const store=new Store(env.DB),reviewId='11111111-1111-4111-8111-111111111111',releaseId='2026-10-08T17:00:00.000Z';
 await env.DB.prepare('INSERT INTO notification_demo_access (subject,review_id,allowed) VALUES (?,?,1) ON CONFLICT(subject,review_id) DO UPDATE SET allowed=1').bind(p.subject,reviewId).run();
 for(const [n,type,at]of [[1,'replay.review.updated',0],[2,'replay.reply.created',83],[3,'replay.question.created',125]]){const event={app:'demo',eventId:p.subject+':sample:'+n,type,actor:null,target:{reviewId,releaseId,at,...(n>1?{entryId:'22222222-2222-4222-8222-222222222222',threadId:'22222222-2222-4222-8222-222222222222'}:{})},occurredAt:'2026-10-08T17:0'+n+':00.000Z',recipientKeys:p.keys};event.key='demo:'+event.eventId;event.digest=await digest(JSON.stringify(event));await store.ingest(event);}
 return json({seeded:true});
}
