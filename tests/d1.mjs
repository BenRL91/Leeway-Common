import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
export function database(path=':memory:'){
 const sql=new DatabaseSync(path);sql.exec('PRAGMA foreign_keys=ON');for(const file of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')))sql.exec(readFileSync(new URL('../drizzle/'+file,import.meta.url),'utf8').replaceAll('--> statement-breakpoint',''));
 return wrap(sql);
}
export function reopen(path){const sql=new DatabaseSync(path);sql.exec('PRAGMA foreign_keys=ON');return wrap(sql);}
function wrap(sql){return {sql,prepare(query){const stmt=sql.prepare(query);let args=[];return {bind(...values){args=values;return this;},async first(){return stmt.get(...args)||null;},async all(){return {results:stmt.all(...args)};},async run(){const result=stmt.run(...args);return {meta:{changes:result.changes}};}};},async batch(stmts){sql.exec('BEGIN IMMEDIATE');try{const result=[];for(const stmt of stmts)result.push(await stmt.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};}
