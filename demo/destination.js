const params=new URLSearchParams(location.search),status=document.getElementById('destination-status');
const r=await fetch('/api/demo/inbox',{cache:'no-store'});const data=await r.json();const id=location.pathname.split('/').pop();const permitted=r.ok&&data.items.some(n=>n.target.reviewId===id);
status.textContent=permitted?'Access verified. Opened at '+(params.get('at')||'0')+' seconds'+(params.has('thread')?' in the requested thread.':'.'):'This sample review is unavailable. Access may have been revoked.';
