import {Fault} from './security.mjs';
export function accessChecker(env,p,store){
 const cache=new Map();
 async function get(path){let r;try{r=await (env.FETCH||fetch)('https://replay.leewaypb.com'+path,{headers:{Cookie:'__Host-yoututor-access='+p.token,Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(8000)});}catch{throw new Fault('DESTINATION_UNAVAILABLE',503);}if([401,403,404].includes(r.status))return null;if(!r.ok)throw new Fault('DESTINATION_UNAVAILABLE',503);const body=await r.json();if(body.ok!==true)throw new Fault('DESTINATION_UNAVAILABLE',503);return body;}
 return async e=>{
  if(e.app==='demo'){if(!p.demo)return false;const r=await store.db.prepare('SELECT allowed FROM notification_demo_access WHERE subject=? AND review_id=?').bind(p.subject,e.target.reviewId).first();return r?.allowed===1;}
  if(p.demo||e.app!=='replay')return false;
  const t=e.target,key=t.reviewId;
  if(!cache.has(key))cache.set(key,get('/api/replay/view/'+key));
  const view=(await cache.get(key))?.review;
  if(!view||view.state!=='released'||view.releasedAt!==t.releaseId)return false;
  if(t.entryId){const discussionKey=key+':discussion';if(!cache.has(discussionKey))cache.set(discussionKey,get('/api/replay/view/'+key+'/discussion'));const entries=(await cache.get(discussionKey))?.entries;if(!Array.isArray(entries))return false;const entry=entries.find(n=>n.id===t.entryId);if(!entry)return false;
   if(e.type==='replay.question.created'&&entry.category!=='Question'||e.type==='replay.reply.created'&&entry.category!=='Reply')return false;
   if(t.at!=null&&entry.at!==t.at)return false;
   if(t.threadId!=null&&![entry.id,entry.thread?.id,entry.parentId].includes(t.threadId))return false;
  }
  return true;
 };
}
export function destination(e){if(e.app==='demo')return '/demo/review/'+e.target.reviewId+'?'+new URLSearchParams({at:String(e.target.at||0),...(e.target.threadId?{thread:e.target.threadId}:{})});const t=e.target;const url=new URL('https://replay.leewaypb.com/replay/view/'+t.reviewId);url.searchParams.set('release',t.releaseId);if(t.at!=null)url.searchParams.set('at',String(t.at));if(t.threadId)url.searchParams.set('thread',t.threadId);if(t.entryId)url.searchParams.set('entry',t.entryId);return url.href;}
