import test from 'node:test';
import assert from 'node:assert/strict';
import {activeSeriesIndex,appendSeries,changeExerciseSeries,selectSeries,steppedSeriesValue,updateSeriesField} from '../src/activeSeries.js';

const initial=()=>({id:7,reps:8,sets:[{weight:'20',reps:'8',completed:true,note:'keep'},{weight:'22,5',reps:'8',completed:false},{weight:'30',reps:'6',completed:false}]});
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
