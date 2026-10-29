import {readFileSync,writeFileSync,mkdirSync,rmSync,readdirSync,copyFileSync} from 'node:fs';
rmSync('dist',{recursive:true,force:true});mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const assets={};const add=(path,file)=>{assets[path]={body:readFileSync(file,'utf8'),type:file.endsWith('.css')?'text/css; charset=utf-8':file.endsWith('.js')||file.endsWith('.mjs')?'text/javascript; charset=utf-8':file.endsWith('.md')?'text/plain; charset=utf-8':'text/html; charset=utf-8'};};
for(const file of readdirSync('demo'))if(file.endsWith('.mp4'))assets['/'+file]={body:readFileSync('demo/'+file).toString('base64'),binary:true,type:'video/mp4'};else add('/'+file,'demo/'+file);
for(const file of ['island.js','transport.js'])add('/modules/notifications/0.1.0/'+file,'packages/notifications/'+file);
for(const file of readdirSync('docs'))if(file.endsWith('.md'))add('/docs/'+file,'docs/'+file);for(const name of ['replay','coaching','paddlelog','picklepoint'])add('/docs/handoffs/'+name+'.md','docs/handoffs/'+name+'.md');
for(const file of readdirSync('service'))if(file!=='assets.mjs')copyFileSync('service/'+file,'dist/server/'+file);
writeFileSync('dist/server/assets.mjs','export const assets='+JSON.stringify(assets)+';\n');copyFileSync('dist/server/worker.mjs','dist/server/index.js');copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');console.log('Built shared service, isolated island, and owner demonstration.');
