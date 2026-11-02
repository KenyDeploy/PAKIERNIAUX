import test from 'node:test';import assert from 'node:assert/strict';
import {confirmationRow,navigateSession,sessionTotals,seriesResultLabel} from '../src/workoutSession.js';
import {confirmSeries,appendSeries} from '../src/activeSeries.js';
import {createSession,completeSession,validSet} from '../src/training.js';
import {addSessionExercise} from '../src/sessionActions.js';
test('bodyweight zero is resolved only by explicit confirmation and never from a body mass guess',()=>{
 const exercise={equipment:'Masa ciała'},row={id:'row',weight:'',reps:'10',repsSuggested:true,completed:false};
 const ready=confirmationRow(exercise,row);assert.equal(ready.weight,'0');assert.equal(ready.completed,false);assert.equal(row.weight,'');assert.ok(validSet(ready));
 assert.equal(confirmationRow({equipment:'Sztanga'},row),row);assert.equal(validSet(row),false);
 assert.equal(confirmationRow(exercise,{...row,weight:'5'}).weight,'5');assert.match(seriesResultLabel(exercise,ready),/masa ciała/);
 assert.equal(sessionTotals({exercises:[{...exercise,sets:[row]}]}).sets,0);
});
test('two confirmed rows produce exact repetitions, sets and external-load volume, excluding drafts and skipped rows',()=>{
 const session={exercises:[{sets:[{weight:'5',reps:'10',completed:true},{weight:'2,5',reps:'10',completed:true},{weight:999,reps:100,completed:false},{weight:999,reps:100,completed:true,skipped:true}]},{skipped:true,sets:[{weight:999,reps:100,completed:true}]}]};
 assert.deepEqual(sessionTotals(session),{sets:2,reps:20,volume:75,exercises:1,drafts:1});
 const result=completeSession({...session,startedAt:1000},2000);assert.equal(result.volume,75);assert.deepEqual(sessionTotals(result),{sets:2,reps:20,volume:75,exercises:1,drafts:0});
});
test('two added exercises extend bidirectional navigation and preserve source plan, rows and IDs through resume',()=>{
 const library=[{id:1,name:'A',sets:3,reps:8,rest:90},{id:2,name:'B',sets:3,reps:10,rest:90},{id:3,name:'C',sets:3,reps:12,rest:60}],plan={id:1,exercises:[1]};
 let session=createSession(plan,library,[],1000);session.exercises[0]=appendSeries(confirmSeries({...session.exercises[0],sets:[{...session.exercises[0].sets[0],weight:'20',reps:'8'}]},0));
 const original=JSON.stringify(session.exercises[0]);session=addSessionExercise(session,library[1],library[1]);session=addSessionExercise(session,library[2],library[2]);
 for(const index of [1,0,1,2,0]){session=navigateSession(session,index);assert.equal(JSON.stringify(session.exercises[0]),original);}
 session=JSON.parse(JSON.stringify(session));assert.equal(navigateSession(session,i=>i+1).index,1);assert.equal(navigateSession({...session,index:undefined},i=>i+1).index,1);
 assert.throws(()=>navigateSession(session,3),/Nie znaleziono/);assert.deepEqual(plan.exercises,[1]);assert.equal(session.exercises.length,3);
});
