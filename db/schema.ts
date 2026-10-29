import {sqliteTable,text,integer,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const events=sqliteTable('notification_events',{
 key:text('key').primaryKey(),app:text('app').notNull(),eventId:text('event_id').notNull(),digest:text('digest').notNull(),type:text('type').notNull(),target:text('target').notNull(),actor:text('actor'),occurredAt:text('occurred_at').notNull(),receivedAt:text('received_at').notNull()
},t=>[index('notification_events_time').on(t.receivedAt,t.key)]);
export const recipients=sqliteTable('notification_recipients',{eventKey:text('event_key').notNull().references(()=>events.key,{onDelete:'cascade'}),recipientKey:text('recipient_key').notNull()},t=>[primaryKey({columns:[t.eventKey,t.recipientKey]}),index('notification_recipient_lookup').on(t.recipientKey,t.eventKey)]);
export const reads=sqliteTable('notification_reads',{eventKey:text('event_key').notNull().references(()=>events.key,{onDelete:'cascade'}),subject:text('subject').notNull(),readAt:text('read_at'),version:integer('version').notNull().default(0)},t=>[primaryKey({columns:[t.eventKey,t.subject]})]);
export const preferences=sqliteTable('notification_preferences',{subject:text('subject').primaryKey(),inApp:integer('in_app').notNull().default(1),version:integer('version').notNull().default(0)});
export const demoAccess=sqliteTable('notification_demo_access',{subject:text('subject').notNull(),reviewId:text('review_id').notNull(),allowed:integer('allowed').notNull().default(1)},t=>[primaryKey({columns:[t.subject,t.reviewId]})]);
