import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {Window} from 'happy-dom';
import {createServer} from 'vite';
import {createSession,completeSession} from '../src/training.js';
import {addSessionExercise,skipSessionExercise,editSessionTargets} from '../src/sessionActions.js';
import {pauseWorkoutClock,startSessionRest,pauseSessionRest} from '../src/trainingClock.js';

test('modified active sessions remain isolated across accounts A/B, cloud writes and reload',async()=>{
  const window=new Window({url:'http://localhost'});
  for(const key of ['window','document','navigator','localStorage'])Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const exercises=[{id:1,name:'A',sets:2,reps:8,rest:90},{id:2,name:'B',sets:2,reps:10,rest:60}];
  const plan={id:1,name:'Plan',exercises:[1]};
  const defaults={plans:[plan],exercises,measurements:[],workouts:[],completedDays:[],activeSession:null};
  const db={a:structuredClone(defaults),b:structuredClone(defaults)},writes=[];
  let currentUser='a',callback,api,root;
  globalThis.__sessionAccountSupabase={auth:{getSession:async()=>({data:{session:{user:{id:currentUser}}}}),onAuthStateChange:cb=>{callback=cb;return{data:{subscription:{unsubscribe(){}}}};}},from(){let read=false,id,payload;const q={select(){read=true;return q;},eq(_,value){id=value;return q;},maybeSingle(){return q;},upsert(value){payload=value;return q;},abortSignal(){if(read)return Promise.resolve({data:{data:structuredClone(db[id])}});writes.push(structuredClone(payload));db[payload.user_id]=structuredClone(payload.data);return Promise.resolve({error:null});}};return q;}};
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'session-accounts-mock',enforce:'pre',resolveId(id){if(id==='./supabase')return '\0session-accounts-supabase';},load(id){if(id==='\0session-accounts-supabase')return 'export const supabase=globalThis.__sessionAccountSupabase;';}}]});
  const {createRoot}=await import('react-dom/client');
  const wait=()=>new Promise(resolve=>setTimeout(resolve,25));
  try{
    const {useTrainingData}=await server.ssrLoadModule('/src/useTrainingData.js');
    function Harness(){api=useTrainingData(defaults);return null;}
    const mount=async()=>{root=createRoot(document.createElement('div'));await act(async()=>{root.render(React.createElement(Harness));await wait();});};
    const switchTo=async id=>{currentUser=id;await act(async()=>{callback('SIGNED_IN',{user:{id}});await wait();});};
    await mount();assert.equal(writes.length,0);
    let draft=createSession(plan,exercises,[],1000);
    draft=addSessionExercise(draft,exercises[1],{sets:3,reps:12,rest:0});
    draft=skipSessionExercise(draft,0,true);
    draft={...pauseWorkoutClock(startSessionRest(draft,120,'B',61000),61000),manualRestSeconds:120};
    draft=pauseSessionRest(draft,62000);
    await act(()=>api.updateData(d=>({...d,activeSession:draft})));
    await act(async()=>{await api.retrySync();});
    assert.equal(writes.at(-1).user_id,'a');
    await switchTo('b');assert.equal(api.data.activeSession,null);assert.equal(api.data.workouts.length,0);
    const bDraft=createSession(plan,exercises,[],2000);
    bDraft.exercises[0].sets[0]={weight:'10',reps:'8',completed:true};
    const bResult=completeSession(bDraft,62000);
    const saveB=d=>({...d,activeSession:null,workouts:d.workouts.some(w=>w.id===bResult.id)?d.workouts:[bResult,...d.workouts]});
    await act(()=>api.updateData(saveB));await act(()=>api.updateData(saveB));
    await act(async()=>{await api.retrySync();});
    assert.equal(writes.at(-1).user_id,'b');assert.equal(db.b.workouts.length,1);assert.equal(db.a.workouts.length,0);
    await switchTo('a');assert.equal(api.data.activeSession.id,draft.id);assert.equal(api.data.activeSession.exercises[0].skipped,true);
    assert.equal(api.data.activeSession.exercises[1].rest,0);assert.equal(api.data.activeSession.exercises[1].sets.length,1);
    assert.equal(api.data.activeSession.pausedAt,61000);assert.equal(api.data.activeSession.restUntil,null);assert.equal(api.data.activeSession.restPausedRemainingMs,119000);assert.equal(api.data.activeSession.manualRestSeconds,120);
    await act(()=>api.updateData(d=>({...d,activeSession:editSessionTargets(skipSessionExercise(d.activeSession,0,false),1,{sets:4,reps:15,rest:30})})));
    await act(async()=>{await api.retrySync();});
    await act(()=>root.unmount());await mount();
    assert.equal(api.data.activeSession.exercises[0].skipped,false);
    assert.equal(api.data.activeSession.exercises[1].targetSets,4);
    assert.equal(api.data.activeSession.exercises[1].sets.length,1);assert.equal(api.data.activeSession.exercises[1].sets[0].reps,'12');
    assert.equal(api.data.activeSession.restPausedRemainingMs,119000);
    assert.deepEqual(api.data.plans[0].exercises,[1]);
    assert.equal(JSON.parse(localStorage.getItem('pakiernia.v2.b')).data.workouts.length,1);
    assert.equal(JSON.parse(localStorage.getItem('pakiernia.v2.a')).data.workouts.length,0);
  }finally{if(root)await act(()=>root.unmount());await server.close();window.happyDOM.abort();delete globalThis.__sessionAccountSupabase;}
});
