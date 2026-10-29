export type RequestTransport=(path:string,options?:{method?:string;body?:unknown;signal?:AbortSignal})=>Promise<any>;
export interface NotificationIsland{refresh():Promise<void>;open():void;close():void;resetSession():Promise<void>;setAppearance(value:'host'|'system'|'dark'|'light'):void;destroy():void;}
export function mountNotifications(container:HTMLElement,options:{request:RequestTransport;onNavigate?:(notification:any)=>void|Promise<void>;appearance?:'host'|'system'|'dark'|'light';pollInterval?:number}):NotificationIsland;
