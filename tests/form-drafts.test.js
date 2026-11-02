import test from 'node:test';
import assert from 'node:assert/strict';
import {formChanged,planFormValues,newPlanDraft,savePlanDraft} from '../src/formDrafts.js';

test('dirty detection ignores number/string form representation and object order, but tracks values, membership and exercise order',()=>{
 const initial={name:'Plan',height:180,targets:{1:{rest:0,reps:8}},exercises:[1,2]};
 assert.equal(formChanged(initial,{exercises:[1,2],targets:{1:{reps:'8',rest:'0'}},height:'180',name:'Plan'}),false);
 assert.equal(formChanged(initial,{...initial,name:'Inny'}),true);
 assert.equal(formChanged(initial,{...initial,exercises:[2,1]}),true);
 assert.equal(formChanged(initial,{...initial,targets:{1:{rest:1,reps:8}}}),true);
 assert.equal(formChanged({weight:null,note:''},{weight:'',note:''}),false);
 const plan={name:'Plan',days:'Pon',exercises:[1]},library=[{id:1,sets:3,reps:8,rest:0}];
 assert.equal(formChanged(planFormValues(plan,library),planFormValues({...plan,targets:{1:{sets:'3',reps:'8',rest:'0'}}},library)),false,'Restoring displayed defaults is not a dirty edit');
});

test('new plan remains a detached draft, has a noncolliding ID, and retries/double save never duplicate a record',()=>{
 const data={plans:[{id:100,name:'Original',exercises:[1]}],workouts:[{id:'history'}],measurements:[{id:'m'}],unknown:{keep:true}};
 const before=JSON.stringify(data),draft=newPlanDraft(data.plans,[{id:1}],100);
 assert.equal(draft.id,101);assert.equal(JSON.stringify(data),before);assert.equal(data.plans.length,1);
 const saved=savePlanDraft(data,{...draft,name:'Nowy',targets:{1:{sets:3,reps:8,rest:0}}},null);
 assert.equal(saved.plans.length,2);assert.equal(saved.plans[0],data.plans[0]);assert.equal(saved.workouts,data.workouts);assert.equal(saved.measurements,data.measurements);assert.equal(saved.unknown,data.unknown);
 assert.equal(savePlanDraft(saved,{...draft,name:'Nowy',targets:{1:{sets:3,reps:8,rest:0}}},null),saved);
 assert.equal(JSON.stringify(data),before);
 assert.throws(()=>savePlanDraft(saved,{...draft,name:'Collision'},null),/istnieje/);
});

test('editing preserves identity and unknown metadata, replaces only the intended plan and rejects stale baseline',()=>{
 const plan={id:7,name:'Old',days:'Pon',exercises:[1],targets:{1:{sets:4,reps:8,rest:0}},extra:'keep'};
 const data={plans:[plan,{id:8,name:'Other',exercises:[]}],activeSession:{id:'started'},workouts:[]};
 const saved=savePlanDraft(data,{...plan,name:'Edited'},plan);
 assert.equal(saved.plans.length,2);assert.equal(saved.plans[0].id,7);assert.equal(saved.plans[0].extra,'keep');assert.equal(saved.plans[0].targets[1].rest,0);assert.equal(saved.plans[1],data.plans[1]);assert.equal(saved.activeSession,data.activeSession);
 assert.throws(()=>savePlanDraft(saved,{...plan,name:'Stale'},plan),/zmienił/);
 assert.equal(data.plans[0].name,'Old');
});
