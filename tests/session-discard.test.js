import test from 'node:test';
import assert from 'node:assert/strict';
import {confirmedSessionSetCount,discardStartedSession} from '../src/sessionActions.js';

const fixture=()=>({activeSession:{id:'started-a',startedAt:1000,index:1,plan:{id:7,name:'Trening A'},exercises:[{id:1,sets:[{id:'s1',weight:'10',reps:'8',completed:true},{id:'s2',weight:'20',reps:'8',completed:true}]},{id:2,skipped:true,sets:[{id:'s3',weight:'30',reps:'8',completed:true},{id:'draft',weight:'40',reps:'8',completed:false}]}]},workouts:[{id:'saved-history'}],plans:[{id:7}],measurements:[{id:'m1'}],unknown:{keep:true}});

test('three confirmed rows, including skipped exercises, require explicit whole-session discard consent',()=>{
  const data=fixture(),before=JSON.stringify(data);
  assert.equal(confirmedSessionSetCount(data.activeSession),3);
  assert.throws(()=>discardStartedSession(data,'started-a'),/Potwierdź/);
  assert.equal(JSON.stringify(data),before);
  const discarded=discardStartedSession(data,'started-a',true);
  assert.equal(discarded.activeSession,null);
  for(const key of ['workouts','plans','measurements','unknown'])assert.equal(discarded[key],data[key]);
  assert.equal(JSON.stringify(data),before);
});

test('an empty session can be discarded directly, but a stale session identity cannot delete another draft',()=>{
  const data=fixture();data.activeSession.exercises.forEach(e=>e.sets.forEach(row=>{row.completed=false;}));
  assert.equal(confirmedSessionSetCount(data.activeSession),0);
  assert.equal(discardStartedSession(data,'started-a').activeSession,null);
  const before=JSON.stringify(data);
  assert.throws(()=>discardStartedSession(data,'started-b',true),/Sesja zmieniła/);
  assert.equal(JSON.stringify(data),before);
  assert.throws(()=>discardStartedSession({...data,activeSession:null},'started-a',true),/Sesja zmieniła/);
});
