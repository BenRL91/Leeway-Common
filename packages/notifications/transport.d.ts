import type {RequestTransport} from './index.js';
export function createTransport(options?:{baseUrl?:string;getAccessToken?:()=>string|null|Promise<string|null>;fetcher?:typeof fetch;headers?:Record<string,string>}):RequestTransport;
