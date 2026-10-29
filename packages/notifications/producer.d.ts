export interface ReplayEventV1 {
 contract:'leewaypb.notifications.event';version:1;app:'replay';eventId:string;
 type:'replay.question.created'|'replay.reply.created'|'replay.review.released'|'replay.review.updated';
 occurredAt:string;actorSubject?:string|null;
 recipients:Array<{subject:string}|{verifiedEmail:string}>;
 target:{reviewId:string;releaseId:string;entryId?:string;threadId?:string;at?:number};
}
export function sendEvent(options:{serviceUrl:string;secret:string;event:ReplayEventV1;fetcher?:typeof fetch;signal?:AbortSignal}):Promise<{accepted:true;duplicate:boolean}>;
