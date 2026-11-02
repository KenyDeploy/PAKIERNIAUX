import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession } from '../src/training.js';
import { activeSeriesIndex, appendSeries, updateSeriesField, confirmSeries } from '../src/activeSeries.js';
import { hasSessionSets, replaceSessionExercise } from '../src/sessionActions.js';

test('suggestions never require replacement confirmation, real entries and legacy results do',()=>{
  const library=[{id:1,name:'A',sets:3,reps:8,rest:90},{id:2,name:'B',sets:3,reps:10,rest:60}];
  const plan={id:1,exercises:[1]},session=createSession(plan,library,[],1000);
  assert.equal(hasSessionSets(session.exercises[0]),false);
  assert.equal(replaceSessionExercise(session,0,library[1],library[1]).exercises[0].id,2);
  for(const changes of [{weight:'0'},{reps:'8',repsSuggested:false},{completed:true},{note:'actual note'},{reps:'8',repsSuggested:undefined}]){
    const edited={...session,exercises:[{...session.exercises[0],sets:[{...session.exercises[0].sets[0],...changes}]}]};
    assert.equal(hasSessionSets(edited.exercises[0]),true);
    assert.throws(()=>replaceSessionExercise(edited,0,library[1],library[1]),/Potwierdź/);
  }
  assert.deepEqual(plan.exercises,[1]);
});

test('ten-row resume retains last edited pointer, falls back to first pending and preserves IDs',()=>{
  let exercise={id:1,reps:8,sets:[]};for(let i=0;i<10;i++)exercise=appendSeries(exercise);
  for(let i=0;i<8;i++)exercise=confirmSeries(updateSeriesField(exercise,i,'weight','20'),i);
  const ids=exercise.sets.map(row=>row.id);
  exercise=updateSeriesField(exercise,9,'weight','35');
  assert.equal(activeSeriesIndex(JSON.parse(JSON.stringify(exercise))),9);
  assert.equal(activeSeriesIndex({...exercise,activeSetIndex:999}),8);
  assert.deepEqual(exercise.sets.map(row=>row.id),ids);
  assert.equal(exercise.sets.filter(row=>row.completed).length,8);
});
