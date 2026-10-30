import test from 'node:test';
import assert from 'node:assert/strict';
import {activeSeriesIndex,appendSeries,removeSeries,seriesReference,seriesNeedsConfirmation,confirmSeries,changeExerciseSeries,selectSeries,steppedSeriesValue,updateSeriesField} from '../src/activeSeries.js';
import {createSession,completeSession,normalizeData} from '../src/training.js';

const initial=()=>({id:7,reps:8,sets:[{weight:'20',reps:'8',completed:true,note:'keep'},{weight:'22,5',reps:'8',completed:false},{weight:'30',reps:'6',completed:false}]});

test('confirmation explicitly selects the next planned row without completing it, then returns to earlier unfinished work',()=>{
  const first=initial();const second=confirmSeries(first,1);
  assert.equal(second.activeSetIndex,2);assert.equal(second.sets[2].completed,false);
  assert.equal(first.sets[1].completed,false);assert.equal(second.sets[0].note,'keep');
  const all=confirmSeries(second,2);assert.equal(activeSeriesIndex(all),-1);assert.equal(all.sets.length,3);
  const earlier={...first,activeSetIndex:2};assert.equal(confirmSeries(earlier,2).activeSetIndex,1);
  assert.equal(confirmSeries(first,0).sets[0].completed,true,'Saving a correction never toggles a performed row off');
});

test('each explicit addition appends a fresh identified row, even with unfinished planned rows',()=>{
  const first=initial(),added=appendSeries(first);
  assert.equal(added.sets.length,4);assert.equal(activeSeriesIndex(added),3);assert.equal(added.sets[3].completed,false);
  assert.deepEqual(added.sets.slice(0,3),first.sets);assert.equal(appendSeries(added).sets.length,5);
  assert.notEqual(added.sets[3].id,appendSeries(added).sets[4].id);
});

test('deletion preserves surviving IDs and metadata, confirms results and entered drafts, and rejects stale references',()=>{
  let exercise={...initial(),sets:initial().sets.map((row,index)=>({...row,id:'set-'+index}))};
  assert.throws(()=>removeSeries(exercise,seriesReference(exercise,0)),/Potwierdź/);
  const reference=seriesReference(exercise,0),removed=removeSeries(exercise,reference,true);
  assert.deepEqual(removed.sets,exercise.sets.slice(1));assert.equal(exercise.sets.length,3);
  assert.throws(()=>removeSeries(updateSeriesField(exercise,0,'weight','99'),reference,true),/zmieniła/);
  const extra=appendSeries(exercise);assert.equal(seriesNeedsConfirmation(extra.sets[3]),false);
  assert.equal(removeSeries(extra,seriesReference(extra,3)).sets.length,3);
  assert.equal(seriesNeedsConfirmation(updateSeriesField(extra,3,'reps','12').sets[3]),true);
  const confirmed=confirmSeries(updateSeriesField(extra,3,'weight','20'),3);
  assert.equal(confirmed.sets[3].repsSuggested,false);
  assert.equal(seriesNeedsConfirmation(updateSeriesField(confirmed,3,'weight','').sets[3]),true,'Previously confirmed repetitions are actual entries, not an empty suggestion');
  const legacy={...initial(),sets:[{weight:'20',reps:'8',completed:true,extra:'keep'},{weight:'',reps:'',completed:false}]};
  assert.equal(removeSeries(legacy,seriesReference(legacy,1)).sets[0].extra,'keep');
});

test('deleting every row survives normalization and finishing never invents a result from the plan goal',()=>{
  const plan={id:1,exercises:[7],targets:{7:{sets:5,reps:8,rest:60}}},library=[{id:7,sets:3,reps:8}];
  const session=createSession(plan,library,[]);assert.equal(session.exercises[0].sets.length,1);
  const empty=removeSeries(session.exercises[0],seriesReference(session.exercises[0],0));
  const restored=normalizeData(JSON.parse(JSON.stringify({activeSession:{...session,exercises:[empty]}})),{});
  assert.equal(restored.activeSession.exercises[0].sets.length,0);assert.equal(restored.activeSession.exercises[0].targetSets,5);
  assert.equal(completeSession(restored.activeSession),null);assert.equal(plan.targets[7].sets,5);
});
test('one active pointer advances only over confirmed rows and preserves old arrays and metadata',()=>{
  const exercise=initial(),before=JSON.stringify(exercise);
  assert.equal(activeSeriesIndex(exercise),1);
  const selected=selectSeries(exercise,2);
  assert.equal(activeSeriesIndex(selected),2);
  const resumed=JSON.parse(JSON.stringify(selected));
  assert.equal(activeSeriesIndex(resumed),2);
  resumed.sets[2].completed=true;
  assert.equal(activeSeriesIndex(resumed),1);
  resumed.sets[1].completed=true;
  assert.equal(activeSeriesIndex(resumed),-1);
  assert.equal(resumed.sets.length,3,'Confirming does not append a row');
  assert.equal(JSON.stringify(exercise),before);
  assert.equal(appendSeries(resumed).sets[3].completed,false);
  assert.equal(activeSeriesIndex(appendSeries(resumed)),3);
  const edited=updateSeriesField(exercise,0,'weight','25');
  assert.equal(edited.sets[0].completed,false);
  assert.equal(edited.sets[0].note,'keep');
  assert.equal(activeSeriesIndex(edited),0);
  assert.deepEqual(edited.sets.slice(1),exercise.sets.slice(1));
});

test('step controls handle Polish decimals, empty fields and lower bounds',()=>{
  assert.equal(steppedSeriesValue('22,5','weight',1),'25');
  assert.equal(steppedSeriesValue('1','weight',-1),'0');
  assert.equal(steppedSeriesValue('','weight',1),'2,5');
  assert.equal(steppedSeriesValue('8','reps',1),'9');
  assert.equal(steppedSeriesValue('1','reps',-1),'1');
  assert.throws(()=>steppedSeriesValue('bad','weight',1));
  assert.throws(()=>steppedSeriesValue('2,5','reps',1));
});

test('series updates are scoped to the original session and exercise, leaving other account data intact',()=>{
  const data={activeSession:{id:'a',index:0,exercises:[initial(),{id:8,sets:[]}]},plans:[{id:1}],workouts:[{id:'saved'}],unknown:{keep:true}};
  const before=JSON.stringify(data);
  const changed=changeExerciseSeries(data,'a',7,0,e=>updateSeriesField(e,1,'reps','10'));
  assert.equal(changed.activeSession.exercises[0].sets[1].reps,'10');
  assert.equal(changed.plans,data.plans);assert.equal(changed.workouts,data.workouts);assert.equal(changed.unknown,data.unknown);
  assert.equal(changed.activeSession.exercises[1],data.activeSession.exercises[1]);
  assert.equal(JSON.stringify(data),before);
  assert.throws(()=>changeExerciseSeries(data,'b',7,0,appendSeries),/Sesja zmieniła/);
  assert.throws(()=>changeExerciseSeries(data,'a',8,0,appendSeries),/Sesja zmieniła/);
  assert.throws(()=>changeExerciseSeries({...data,activeSession:{...data.activeSession,exercises:[{...initial(),skipped:true}]}},'a',7,0,appendSeries),/Cofnij/);
});
