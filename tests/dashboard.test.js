import test from 'node:test';
import assert from 'node:assert/strict';
import {dashboardMetrics,dashboardPlan,recordedWeights} from '../src/dashboard.js';
import {dateKey} from '../src/training.js';

const now=new Date(2026,9,30,12);
const row=(weight,reps,extra={})=>({weight,reps,completed:true,...extra});
const workout=(day,sets,extra={})=>({id:'session-'+day,completedAt:new Date(2026,9,day,10).getTime(),volume:999999,exercises:[{id:1,sets}],...extra});

test('progress linked from the dashboard excludes missing, unconfirmed and skipped loads instead of producing NaN or fictional records',()=>{
  const exercise={sets:[row('20','8'),row(null,'10'),row('','8'),row('999','8',{completed:false}),row('999','8',{skipped:true}),row('bad','8'),row('0','10')]};
  assert.deepEqual(recordedWeights(exercise),[20,0]);
  assert.deepEqual(recordedWeights({...exercise,skipped:true}),[]);
});

test('dashboard counts manual attendance without inventing sets or volume and ignores unchecked/skipped rows',()=>{
  const workouts=[workout(30,[row('20','8'),row('999','10',{completed:false}),row('999','10',{skipped:true}),row('bad','10')]),workout(28,[row('30','5'),row(null,'10')]),workout(20,[row('100','1')])];
  workouts[0].exercises.push({id:2,skipped:true,sets:[row('999','10')]});
  const before=JSON.stringify(workouts);
  const stats=dashboardMetrics(workouts,['2026-10-28','2026-10-29','2026-10-29'],now);
  assert.equal(stats.trainingCount,4);assert.equal(stats.sets,3);assert.equal(stats.volume,310);assert.equal(stats.loadedSets,2);assert.equal(stats.streak,3);
  assert.equal(stats.week.filter(day=>day.attended).length,3);
  assert.equal(JSON.stringify(workouts),before);
  const manual=dashboardMetrics([],['2026-10-30'],now);
  assert.equal(manual.trainingCount,1);assert.equal(manual.sets,0);assert.equal(manual.volume,0);
});

test('seven local days have an inclusive midnight boundary, exclude future results and support same-day sessions',()=>{
  const start=new Date(2026,9,24,0).getTime();
  const rows=[workout(24,[row('10','2')],{completedAt:start}),workout(24,[row('10','3')],{id:'second'}),workout(23,[row('999','1')],{completedAt:start-1}),workout(31,[row('999','1')])];
  const stats=dashboardMetrics(rows,['2026-10-24'],now);
  assert.equal(stats.trainingCount,4,'A day marked manually must not duplicate recorded attendance');
  assert.equal(stats.sets,2);assert.equal(stats.volume,50);
  assert.equal(stats.week[0].date,'2026-10-26');assert.equal(stats.week[6].date,'2026-11-01');
  assert.equal(dashboardMetrics([],[],now).streak,0);
});

test('bodyweight without a recorded load remains a performed set without fabricated kilograms',()=>{
  const stats=dashboardMetrics([workout(30,[row('','12'),row('0','8')])],[],now);
  assert.equal(stats.sets,2);assert.equal(stats.loadedSets,1);assert.equal(stats.volume,0);
  assert.equal(dashboardMetrics([workout(30,[row(null,'12')])],[],now).loadedSets,0);
});

test('plan selection respects a running session, manual choice and explicit weekday schedules without mutating plans',()=>{
  const plans=[{id:1,name:'Góra',days:'Pon · Czw',exercises:[1]},{id:2,name:'Dół',days:'Wt · Pt',exercises:[2]}];
  const before=JSON.stringify(plans),today=dateKey(now);
  assert.equal(dashboardPlan(plans,null,null,today).plan.id,2);
  assert.equal(dashboardPlan(plans,null,null,today).label,'Dzisiaj na planie');
  assert.equal(dashboardPlan(plans,1,null,today).label,'Wybrany plan');
  const active={plan:{id:99,name:'Zapisana sesja',exercises:[]}};
  assert.equal(dashboardPlan(plans,1,active,today).plan.id,99);
  assert.equal(dashboardPlan(plans,null,null,'2026-11-01').label,'Twój plan · wybierz na dziś');
  assert.equal(dashboardPlan([],null,null,today).plan,null);
  assert.equal(JSON.stringify(plans),before);
});
