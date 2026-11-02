import test from 'node:test';
import assert from 'node:assert/strict';
import {premiumInsights} from '../src/motivation.js';
const now=new Date(2026,10,2,12);
const session=(id,day,weight,reps=8,exerciseId=1)=>({id,completedAt:new Date(2026,9,day,10).getTime(),exercises:[{id:exerciseId,name:'Ćwiczenie '+exerciseId,sets:[{weight,reps,completed:true}]}]});
test('XP and seven-day charts come from real saved results; manual attendance never invents load',()=>{
 const first=session('a',30,20),pending=session('pending',31,999);pending.exercises[0].sets[0].completed=false;
 const future={...session('future',30,999),completedAt:now.getTime()+1};
 const source=[first,first,pending,future,{id:'empty',completedAt:now.getTime(),exercises:[]}];const before=JSON.stringify(source);
 const r=premiumInsights(source,['2026-10-30','2026-10-31','2026-10-31','2099-01-01'],[],now);
 assert.equal(r.xp,120);assert.equal(r.level,1);assert.equal(r.days.reduce((n,d)=>n+d.volume,0),160);assert.equal(r.days.reduce((n,d)=>n+d.trainings,0),2);
 assert.equal(r.badges.find(b=>b.id==='first').earned,true);assert.equal(r.badges.find(b=>b.id==='record').earned,false);assert.equal(JSON.stringify(source),before);
 const empty=premiumInsights([],[],[],now);assert.equal(empty.xp,0);assert.ok(empty.badges.every(b=>!b.earned));assert.deepEqual(empty.trend,[]);
});
test('records require a prior result with the same stable exercise ID and repetitions',()=>{
 const rows=[session('a',27,20,8),session('b',28,30,6),session('c',29,22.5,8),session('d',30,100,8,2)];
 const r=premiumInsights(rows,[],[],now);assert.equal(r.weeklyRecord.id,1);assert.equal(r.weeklyRecord.delta,2.5);assert.equal(r.weeklyRecord.reps,8);assert.ok(r.trend.every(p=>p.id===1 && p.reps===8));
 assert.equal(r.badges.find(b=>b.id==='record').earned,true);
 assert.equal(premiumInsights(rows.slice(0,2),[],[],now).weeklyRecord,null);
 const skipped=structuredClone(rows);skipped[2].exercises[0].skipped=true;assert.equal(premiumInsights(skipped,[],[],now).weeklyRecord,null);
});
test('levels, streak and regular measurement badges are deterministic and account-local',()=>{
 const rows=Array.from({length:10},(_,i)=>session('w'+i,20+i,20+i));
 const measurements=[{date:'2026-10-01',waist:90},{date:'2026-10-08',waist:89},{date:'2026-10-15',weight:80},{date:'2026-10-15',weight:81},{date:'2026-10-20'},{date:'2099-01-01',waist:1}];
 const r=premiumInsights(rows,[],measurements,now);assert.equal(r.xp,1045);assert.equal(r.level,4);assert.equal(r.levelXp,145);assert.ok(r.badges.filter(b=>b.id!=='twentyfive').every(b=>b.earned));assert.equal(r.badges.find(b=>b.id==='twentyfive').earned,false);
 assert.equal(premiumInsights([],[],measurements.slice(0,2),now).badges.find(b=>b.id==='measure').earned,false);
 assert.equal(premiumInsights([],[],[],now).level,1);
 assert.equal(premiumInsights(rows.slice(1),[],measurements,now).xp,945,'Deleting a record recomputes points, without an award ledger');
 const bodyweight=session('bw',30,null);assert.equal(premiumInsights([bodyweight],[],[],now).xp,100);assert.equal(premiumInsights([bodyweight],[],[],now).days.reduce((n,d)=>n+d.volume,0),0);
});
