export class Fault extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status;}}
export const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value);
export const hex=bytes=>Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
export async function digest(value){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
export function canonical(value){if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
export async function signature(secret,timestamp,body){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamp+'\nPOST\n/v1/events\n'+body)));}
export async function verifyProducer(request,env,body){
 const app=request.headers.get('x-leeway-producer'),stamp=request.headers.get('x-leeway-timestamp'),sig=request.headers.get('x-leeway-signature');
 if(app!=='replay')throw new Fault('PRODUCER_NOT_ENABLED',403);
 if(!env.REPLAY_PRODUCER_SECRET||env.REPLAY_PRODUCER_SECRET.length<32)throw new Fault('PRODUCER_NOT_CONFIGURED',503);
 if(!stamp||!/^\d{13}$/.test(stamp)||Math.abs(Date.now()-Number(stamp))>300000||!sig||!/^[a-f0-9]{64}$/.test(sig))throw new Fault('INVALID_SIGNATURE',401);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.REPLAY_PRODUCER_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 const bytes=Uint8Array.from(sig.match(/../g),x=>parseInt(x,16));
 if(!await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(stamp+'\nPOST\n/v1/events\n'+body)))throw new Fault('INVALID_SIGNATURE',401);
 return app;
}
export async function boundedBody(request,max=32768){const reader=request.body?.getReader();if(!reader)throw new Fault('JSON_REQUIRED');let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new Fault('BODY_TOO_LARGE',413);}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const b of chunks){bytes.set(b,offset);offset+=b.length;}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
export function json(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Authorization, Origin','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});}
export async function principal(request,env){
 const bearer=request.headers.get('Authorization');if(!bearer||!/^Bearer [A-Za-z0-9_.-]+$/.test(bearer)||bearer.length>16384)throw new Fault('SIGN_IN_REQUIRED',401);
 if(env.SUPABASE_URL!=='https://eclxqfmuqeavwwafbvhu.supabase.co'||!env.SUPABASE_PUBLISHABLE_KEY)throw new Fault('AUTH_NOT_CONFIGURED',503);
 let response;try{response=await (env.FETCH||fetch)(env.SUPABASE_URL+'/auth/v1/user',{headers:{Authorization:bearer,apikey:env.SUPABASE_PUBLISHABLE_KEY},redirect:'manual',signal:AbortSignal.timeout(8000)});}catch{throw new Fault('AUTH_UNAVAILABLE',503);}
 if(!response.ok)throw new Fault(response.status>=500||response.status===429?'AUTH_UNAVAILABLE':'SIGN_IN_REQUIRED',response.status>=500||response.status===429?503:401);
 const u=await response.json();if(!uuid(u.id)||u.is_anonymous)throw new Fault('SIGN_IN_REQUIRED',401);
 const email=typeof u.email==='string'&&u.email_confirmed_at&&Number.isFinite(Date.parse(u.email_confirmed_at))?u.email.trim().toLowerCase():null;
 return {subject:u.id,token:bearer.slice(7),email,keys:['sub:'+u.id,...(email?['email:'+await digest(email)]:[])]};
}
export function sameOrigin(request){if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('x-leeway-notifications')!=='1')throw new Fault('SAME_ORIGIN_REQUIRED',403);}
