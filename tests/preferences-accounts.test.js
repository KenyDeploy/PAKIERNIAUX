import {saveTheme} from "../src/preferences.js";
import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act} from 'react';
import {Window} from 'happy-dom';
import {createServer} from 'vite';
import {saveBodyProfile,saveBodyMeasurement,bodyState} from '../src/bodyMeasurements.js';

test('theme preferences survive account changes, failed synchronization and remount',async()=>{
  const window=new Window({url:'http://localhost'});
  for(const key of ['window','document','navigator','localStorage'])Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const defaults={plans:[],exercises:[],measurements:[],workouts:[],completedDays:[],activeSession:null};
  const db={a:{...defaults,measurements:[{id:'legacy-a',date:'2026-10-01',biceps:35}],keep:'A'},b:{...defaults,keep:'B'}},writes=[];
  let currentUser='a',callback,api,root,failWrite=false;
  globalThis.__bodySupabase={auth:{getSession:async()=>({data:{session:{user:{id:currentUser}}}}),onAuthStateChange:cb=>{callback=cb;return{data:{subscription:{unsubscribe(){}}}};}},from(){let read=false,id,payload;const q={select(){read=true;return q;},eq(_,value){id=value;return q;},maybeSingle(){return q;},upsert(value){payload=value;return q;},abortSignal(){if(read)return Promise.resolve({data:{data:structuredClone(db[id])}});if(failWrite)return Promise.resolve({error:new Error('offline')});writes.push(structuredClone(payload));db[payload.user_id]=structuredClone(payload.data);return Promise.resolve({error:null});}};return q;}};
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},plugins:[{name:'body-accounts-mock',enforce:'pre',resolveId(id){if(id==='./supabase')return '\0body-accounts-supabase';},load(id){if(id==='\0body-accounts-supabase')return 'export const supabase=globalThis.__bodySupabase;';}}]});
  const {createRoot}=await import('react-dom/client');const wait=()=>new Promise(resolve=>setTimeout(resolve,25));const now=new Date(2026,9,30,12).getTime();
  try {
    const {useTrainingData}=await server.ssrLoadModule('/src/useTrainingData.js');function Harness(){api=useTrainingData(defaults);return null;}
    const mount=async()=>{root=createRoot(document.createElement('div'));await act(async()=>{root.render(React.createElement(Harness));await wait();});};
    const login=async id=>{currentUser=id;await act(async()=>{callback('SIGNED_IN',{user:{id}});await wait();});};
    await mount();assert.equal(writes.length,0);
    await act(()=>api.updateData(data=>saveBodyMeasurement(saveBodyProfile(data,{model:'female',build:'athletic',heightCm:170,goal:'muscle',targetWeight:70,goalStartedOn:'2026-10-01'},data.bodyProfile||{},now),{date:'2026-10-28',weight:80,bicepsLeft:36},null,now)));
    await act(()=>api.updateData(data=>saveTheme(data,"magenta")));
    failWrite=true;await act(async()=>{await api.retrySync();});assert.equal(JSON.parse(localStorage.getItem('pakiernia.v2.a')).pending,true);assert.equal(db.a.bodyProfile,undefined);
    await login('b');assert.equal(api.data.bodyProfile,undefined);assert.equal(api.data.measurements.length,0);
    assert.equal(api.data.preferences,undefined);
    failWrite=false;
    await act(()=>api.updateData(data=>saveTheme(data,"blue")));
    await act(()=>api.updateData(data=>saveBodyMeasurement(saveBodyProfile(data,{model:'male',build:'larger',heightCm:190,goal:'strength',targetWeight:'',goalStartedOn:'2026-10-20'},data.bodyProfile||{},now),{date:'2026-10-29',weight:100,bicepsRight:44},null,now)));
    await act(async()=>{await api.retrySync();});assert.equal(writes.at(-1).user_id,'b');
    await login('a');assert.equal(api.data.preferences.theme,'magenta');assert.equal(api.data.bodyProfile.model,'female');assert.equal(api.data.bodyGoalHistory.length,1);
    assert.equal(bodyState(api.data.measurements,'2026-10-30').values.bicepsRight,null);assert.equal(api.data.measurements.find(row=>row.id==='legacy-a').biceps,35);
    await act(async()=>{await api.retrySync();});assert.equal(writes.at(-1).user_id,'a');
    await act(()=>api.updateData(data=>saveBodyProfile(data,{...data.bodyProfile,goal:'maintain',targetWeight:80,goalStartedOn:'2026-10-30'},data.bodyProfile,now+1)));
    await act(async()=>{await api.retrySync();});await act(()=>root.unmount());await mount();
    assert.equal(api.data.preferences.theme,'magenta');assert.equal(api.data.bodyGoalHistory.length,2);assert.equal(api.data.bodyProfile.goal,'maintain');assert.equal(api.data.keep,'A');
    await login('b');assert.equal(api.data.preferences.theme,'blue');assert.equal(api.data.bodyGoalHistory.length,1);assert.equal(api.data.bodyProfile.goal,'strength');assert.equal(bodyState(api.data.measurements,'2026-10-30').values.bicepsLeft,null);assert.equal(api.data.keep,'B');
    assert.equal(db.a.bodyProfile.sex,undefined);assert.equal(db.b.bodyProfile.sex,undefined);
  }finally{if(root)await act(()=>root.unmount());await server.close();window.happyDOM.abort();delete globalThis.__bodySupabase;}
});
