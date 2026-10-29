import {Fault,uuid,digest,canonical} from './security.mjs';
export const TYPES={'replay.question.created':'New question on your review','replay.reply.created':'New reply on your review','replay.review.released':'Your review has been released','replay.review.updated':'Your review has been updated'};
const date=x=>{try{return typeof x==='string'&&new Date(x).toISOString()===x;}catch{return false;}};
const exact=(o,fields)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>fields.includes(k));
export async function normalizeEvent(input,app){
 if(!exact(input,['contract','version','app','eventId','type','occurredAt','actorSubject','recipients','target'])||input.contract!=='leewaypb.notifications.event'||input.version!==1||input.app!==app||!TYPES[input.type]||typeof input.eventId!=='string'||!/^[A-Za-z0-9:._-]{1,160}$/.test(input.eventId)||!date(input.occurredAt)||Date.parse(input.occurredAt)>Date.now()+300000||input.actorSubject!=null&&!uuid(input.actorSubject))throw new Fault('INVALID_EVENT');
 const t=input.target;if(!exact(t,['reviewId','releaseId','entryId','threadId','at'])||!uuid(t.reviewId)||!date(t.releaseId)||t.entryId!=null&&!uuid(t.entryId)||t.threadId!=null&&!uuid(t.threadId)||t.at!=null&&(!Number.isFinite(t.at)||t.at<0||t.at>604800))throw new Fault('INVALID_TARGET');
 if((input.type==='replay.question.created'||input.type==='replay.reply.created')&&!uuid(t.entryId))throw new Fault('ENTRY_REQUIRED');
 if(!Array.isArray(input.recipients)||input.recipients.length<1||input.recipients.length>10)throw new Fault('INVALID_RECIPIENTS');
 const keys=[];for(const r of input.recipients){if(exact(r,['subject'])&&uuid(r.subject)){if(r.subject!==input.actorSubject)keys.push('sub:'+r.subject);}else if(exact(r,['verifiedEmail'])&&typeof r.verifiedEmail==='string'&&r.verifiedEmail.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.verifiedEmail)){keys.push('email:'+await digest(r.verifiedEmail.trim().toLowerCase()));}else throw new Fault('INVALID_RECIPIENT');}
 const event={app,eventId:input.eventId,type:input.type,target:t,occurredAt:input.occurredAt,actor:input.actorSubject||null,recipientKeys:[...new Set(keys)].sort()};
 return {...event,key:app+':'+input.eventId,digest:await digest(canonical(event))};
}
