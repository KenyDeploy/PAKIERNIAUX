import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, completeSession, normalizeData } from '../src/training.js';
import { exerciseHistory } from '../src/exerciseHistory.js';
import { addSessionExercise, replaceSessionExercise, skipSessionExercise, removeSessionExercise, editSessionTargets, addSessionSet, sessionTargets } from '../src/sessionActions.js';

const library=[{id:1,name:'A',sets:3,reps:8,rest:90},{id:2,name:'B',sets:3,reps:10,rest:90},{id:3,name:'C',sets:2,reps:12,rest:60}];
const plan={id:10,name:'Plan',exercises:[1,2],targets:{1:{sets:3,reps:8,rest:90}}};
const targets={sets:2,reps:9,rest:0};
const initial=()=>createSession(plan,library,[],1000);

test('removal requires confirmation, keeps other data and indexes, and supports an empty session',()=>{
  const session=initial();session.index=1;
  session.exercises[0].sets[0]={weight:'20',reps:'8',completed:true};
  const before=JSON.stringify(session);
  assert.throws(()=>removeSessionExercise(session,1),/Potwierdź/);
  assert.equal(JSON.stringify(session),before);
  const removed=removeSessionExercise(session,1,true);
  assert.equal(removed.index,0);assert.equal(removed.id,session.id);assert.equal(removed.startedAt,session.startedAt);
  assert.deepEqual(removed.exercises[0].sets,session.exercises[0].sets);
  assert.deepEqual(removed.plan.exercises,[1]);assert.deepEqual(plan.exercises,[1,2]);
  const beforeCurrent=removeSessionExercise(session,0,true);
  assert.equal(beforeCurrent.index,0);assert.equal(beforeCurrent.exercises[0].id,2);
  const empty=removeSessionExercise(removed,0,true);
  assert.equal(empty.index,0);assert.deepEqual(empty.exercises,[]);assert.deepEqual(empty.plan.exercises,[]);
  assert.equal(completeSession(empty),null);
  const restored=JSON.parse(JSON.stringify(empty));
  assert.equal(addSessionExercise(restored,library[2],targets).exercises[0].id,3);
});

test('add and replace affect only the current session, reject duplicate exercise IDs and never move results',()=>{
  const session=initial(),before=JSON.stringify({session,plan,library});
  session.exercises[0].sets[0]={weight:'50',reps:'8',completed:true};
  const source=JSON.stringify(session);
  assert.throws(()=>replaceSessionExercise(session,0,library[2],targets),/Potwierdź/);
  assert.equal(JSON.stringify(session),source);
  const replaced=replaceSessionExercise(session,0,library[2],targets,true);
  assert.equal(replaced.exercises[0].id,3);
  assert.equal(replaced.exercises[0].sets.length,1);assert.equal(replaced.exercises[0].targetSets,2);
  assert.equal(replaced.exercises[0].sets[0].weight,'');assert.equal(replaced.exercises[0].sets[0].reps,'9');assert.equal(replaced.exercises[0].sets[0].completed,false);
  assert.equal(replaced.exercises[0].rest,0);
  assert.equal(replaced.id,session.id);assert.equal(replaced.startedAt,1000);
  assert.deepEqual(replaced.plan.exercises,[3,2]);
  assert.deepEqual(plan.exercises,[1,2]);
  const added=addSessionExercise(session,library[2],targets);
  assert.equal(added.index,2);assert.equal(added.exercises.length,3);
  assert.equal(added.exercises[0],session.exercises[0]);
  assert.equal(added.exercises[2].targetSets,2);
  assert.throws(()=>addSessionExercise(added,library[2],targets),/już/);
  assert.throws(()=>replaceSessionExercise(session,0,library[1],targets,true),/już/);
  assert.equal(JSON.stringify(plan),JSON.stringify(JSON.parse(before).plan));
  assert.equal(JSON.stringify(library),JSON.stringify(JSON.parse(before).library));
});

test('skipping and undo preserve entered rows, survive resume and exclude skipped results from history',()=>{
  const session=initial();
  session.exercises[0].sets[0]={weight:'999',reps:'10',completed:true};
  session.exercises[1].sets[0]={weight:'20',reps:'8',completed:true};
  const skipped=skipSessionExercise(session,0,true);
  assert.deepEqual(skipped.exercises[0].sets,session.exercises[0].sets);
  const resumed=normalizeData(JSON.parse(JSON.stringify({activeSession:skipped})),{}).activeSession;
  assert.equal(resumed.exercises[0].skipped,true);
  const result=completeSession(resumed,61000);
  assert.equal(result.volume,160);
  assert.deepEqual(result.exercises.map(e=>e.id),[2]);
  assert.equal(exerciseHistory([result],1).length,0);
  const undone=skipSessionExercise(resumed,0,false);
  assert.equal(completeSession(undone,61000).volume,10150);
  assert.equal(completeSession(skipSessionExercise(resumed,1,true)),null);
  assert.throws(()=>addSessionSet(resumed,0),/Cofnij/);
});

test('parameters never create or remove rows; explicit additions use the new repetition goal',()=>{
  const session=initial();
  session.exercises[0].sets[0]={weight:'22,5',reps:'8',completed:true};
  const edited=editSessionTargets(session,0,{sets:1,reps:12,rest:0});
  assert.equal(edited.exercises[0].targetSets,1);
  assert.deepEqual(edited.exercises[0].sets,session.exercises[0].sets);
  assert.equal(edited.exercises[0].rest,0);
  const additional=addSessionSet(edited,0);
  assert.equal(additional.exercises[0].sets[1].reps,'12');assert.equal(additional.exercises[0].sets[1].completed,false);assert.ok(additional.exercises[0].sets[1].id);
  const expanded=editSessionTargets(additional,0,{sets:6,reps:15,rest:120});
  assert.equal(expanded.exercises[0].sets.length,2);assert.equal(expanded.exercises[0].targetSets,6);
  assert.equal(expanded.exercises[0].sets[1].reps,'12');
  assert.deepEqual(expanded.exercises[0].sets[0],session.exercises[0].sets[0]);
  assert.deepEqual(plan.targets[1],{sets:3,reps:8,rest:90});
  assert.deepEqual(sessionTargets({sets:'2',reps:'8',rest:'0'}),{sets:2,reps:8,rest:0});
  for(const invalid of [{sets:0,reps:8,rest:90},{sets:3,reps:1.5,rest:90},{sets:3,reps:8,rest:''}]) assert.throws(()=>sessionTargets(invalid));
});
