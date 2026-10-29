import {api,userApi,demoPrincipal,seedDemo} from './api.mjs';
import {Fault,json,sameOrigin} from './security.mjs';
import {assets} from './assets.mjs';
const ORIGINS=new Set(['https://replay.leewaypb.com','https://leewaypb.com','https://www.leewaypb.com','https://paddlelog.leewaypb.com','https://picklepoint.leewaypb.com']);
export default {async fetch(request,env){const u=new URL(request.url),origin=request.headers.get('Origin');let cors=false;
 try{
  if(u.pathname.startsWith('/v1/')){if(origin&&origin!==u.origin&&!ORIGINS.has(origin))throw new Fault('ORIGIN_NOT_ALLOWED',403);cors=!!origin&&ORIGINS.has(origin);if(request.method==='OPTIONS')return withCors(new Response(null,{status:204}),origin);const r=await api(request,env);return cors?withCors(r,origin):r;}
  // The independent demonstration uses Sites' verified owner identity only. It cannot act as a Supabase user.
  if(!request.headers.get('oai-authenticated-user-id')&&request.method==='GET'&&(u.pathname==='/'||u.pathname==='/index.html'||u.pathname.startsWith('/demo/review/')))return new Response(null,{status:302,headers:{Location:'/signin-with-chatgpt?return_to='+encodeURIComponent(u.pathname+u.search),'Cache-Control':'private, no-store'}});
  const p=await demoPrincipal(request,env);
  if(u.pathname.startsWith('/api/demo/')){if(!['GET','HEAD'].includes(request.method))sameOrigin(request);if(u.pathname==='/api/demo/seed'&&request.method==='POST')return await seedDemo(env,p);if(u.pathname==='/api/demo/revoke'&&request.method==='POST'){await env.DB.prepare('UPDATE notification_demo_access SET allowed=0 WHERE subject=?').bind(p.subject).run();return json({revoked:true});}return await userApi(request,env,p,'/api/demo');}
  if(!['GET','HEAD'].includes(request.method))throw new Fault('METHOD_NOT_ALLOWED',405);
  const path=u.pathname==='/'?'/index.html':u.pathname.startsWith('/demo/review/')?'/destination.html':u.pathname;
  const a=assets[path];if(!a)throw new Fault('NOT_FOUND',404);
  return new Response(request.method==='HEAD'?null:a.binary?Uint8Array.from(atob(a.body),c=>c.charCodeAt(0)):a.body,{headers:{'Content-Type':a.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"}});
 }catch(e){const response=json({error:e instanceof Fault?e.code:'SERVICE_UNAVAILABLE'},e instanceof Fault?e.status:503);return cors?withCors(response,origin):response;}
}};
function withCors(r,origin){const h=new Headers(r.headers);if(ORIGINS.has(origin)){h.set('Access-Control-Allow-Origin',origin);h.set('Access-Control-Allow-Methods','GET, PUT, POST, OPTIONS');h.set('Access-Control-Allow-Headers','Authorization, Content-Type');h.set('Access-Control-Max-Age','600');h.set('Vary','Origin, Authorization');}return new Response(r.body,{status:r.status,headers:h});}
