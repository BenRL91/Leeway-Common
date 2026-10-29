import {spawnSync} from 'node:child_process';
const r=spawnSync('npm',['pack','./packages/notifications','--pack-destination','./'],{stdio:'inherit'});process.exit(r.status);
