import test from 'node:test';
import assert from 'node:assert/strict';
import React, {act} from 'react';
import {Window} from 'happy-dom';
import {createServer} from 'vite';

test('cloud hydration does not auto-write; accounts and failed reads remain isolated', async () => {
 const window=new Window({url:'http://localhost'});
 for(const key of ['window','document','navigator','localStorage'])Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const writes=[];let callback;let currentUser='a';let failRead=false;let failWrite=false;
 const db={a:{plans:[{id:1,name:'Plan A',exercises:[]}],measurements:[]},b:{plans:[],measurements:[]}};
 globalThis.__testSupabase={auth:{getSession:async()=>({data:{session:{user:{id:currentUser}}}}),onAuthStateChange:cb=>{callback=cb;return{data:{listener:null,subscription:{unsubscribe(){}}}};},signOut:async()=>callback('SIGNED_OUT',null)},from(){let selected=false,id,payload;const q={select(){selected=true;return q;},eq(_,value){id=value;return q;},maybeSingle(){return q;},upsert(p){payload=p;return q;},abortSignal(){if(selected)return Promise.resolve(failRead?{error:new Error('read failed')}:{data:db[id]?{data:db[id]}:null});writes.push(payload);return Promise.resolve(failWrite?{error:new Error('write failed')}:{error:null});}};return q;}};
 const server=await createServer({server:{middlewareMode:true,hmr:false},plugins:[{name:'mock-supabase',enforce:'pre',resolveId(id){if(id==='./supabase')return '\0test-supabase';},load(id){if(id==='\0test-supabase')return 'export const supabase = globalThis.__testSupabase;';}}]});
 const {createRoot}=await import('react-dom/client');let root;let api;
 const wait=()=>new Promise(resolve=>setTimeout(resolve,20));
 try{
  const {useTrainingData}=await server.ssrLoadModule('/src/useTrainingData.js');
  const defaults={plans:[],exercises:[],measurements:[],workouts:[],completedDays:[],activeSession:null};
  function Harness(){api=useTrainingData(defaults);return React.createElement('div',null,api.syncStatus);}
  root=createRoot(document.createElement('div'));await act(async()=>{root.render(React.createElement(Harness));await wait();});
  assert.equal(api.data.plans[0].name,'Plan A');assert.equal(writes.length,0);
  await act(()=>api.update('plans',[{id:2,name:'A changed',exercises:[]}]));
  failWrite=true;await act(async()=>{await api.retrySync();});
  assert.match(api.syncStatus,/ponów synchronizację/);
  assert.equal(JSON.parse(localStorage.getItem('pakiernia.v2.a')).pending,true);
  failWrite=false;await act(async()=>{await api.retrySync();});
  assert.equal(JSON.parse(localStorage.getItem('pakiernia.v2.a')).pending,false);
  const beforeSwitch=writes.length;
  currentUser='b';await act(async()=>{callback('SIGNED_IN',{user:{id:'b'}});await wait();});
  assert.deepEqual(api.data.plans,[]);assert.equal(writes.length,beforeSwitch);
  assert.equal(api.authUser.id,'b');
  await act(()=>api.update('waterByDate',{'2026-10-29':1}));
  await act(async()=>{await api.retrySync();});assert.equal(writes.at(-1).user_id,'b');
  failRead=true;currentUser='c';await act(async()=>{callback('SIGNED_IN',{user:{id:'c'}});await wait();});
  assert.equal(api.cloudHydrated,false);assert.deepEqual(api.data.plans,[]);
  assert.match(api.syncStatus,/Nie udało się wczytać/);
  assert.equal(writes.some(w=>w.user_id==='c'),false);
 }finally{if(root)await act(()=>root.unmount());await server.close();window.happyDOM.abort();delete globalThis.__testSupabase;}
});
