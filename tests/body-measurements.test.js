import test from 'node:test';
import assert from 'node:assert/strict';
import {bodyState,compareBodyStates,saveBodyMeasurement,deleteBodyMeasurement,measurementRef,saveBodyProfile,bodyNumber} from '../src/bodyMeasurements.js';
import {bodyModelCapabilities,prepareBodyTrend} from '../src/bodyModelAdapter.js';
const now=new Date(2026,9,30,12).getTime();
const initial=()=>({measurements:[{id:'old',date:'2026-10-20',biceps:37,thigh:55,weight:80,createdAt:1000,custom:'keep'}],legacyMeasurements:[{date:'Dzisiaj',weight:70}],plans:[{id:1}],workouts:[{id:2}],unknown:{safe:true}});

test('new partial bilateral measurements preserve legacy sides, older records and unrelated snapshot fields',()=>{
  const source=initial(),before=JSON.stringify(source);
  const result=saveBodyMeasurement(source,{date:'2026-10-28',bicepsLeft:'38,5',calfRight:'39',note:'po treningu'},null,now);
  assert.equal(JSON.stringify(source),before);assert.equal(result.measurements[0].bicepsLeft,38.5);
  assert.equal(result.measurements[0].weight,undefined);assert.equal(result.measurements[0].bicepsRight,undefined);
  assert.deepEqual(result.measurements[1],source.measurements[0]);assert.equal(result.measurements[1].bicepsRight,undefined);
  assert.equal(result.plans,source.plans);assert.equal(result.workouts,source.workouts);assert.equal(result.legacyMeasurements,source.legacyMeasurements);assert.equal(result.unknown,source.unknown);
  const state=bodyState(result.measurements,'2026-10-30');
  assert.equal(state.values.biceps,37);assert.equal(state.values.bicepsLeft,38.5);assert.equal(state.values.bicepsRight,null);assert.equal(state.values.weight,80);assert.equal(state.sources.weight.date,'2026-10-20');
});

test('edit/delete use stable identities, preserve extras and reject concurrent changes',()=>{
  const source=initial(),ref=measurementRef(source.measurements,source.measurements[0]);
  const edited=saveBodyMeasurement(source,{date:'2026-10-21',biceps:'38',note:'korekta'},ref,now);
  assert.equal(edited.measurements[0].id,'old');assert.equal(edited.measurements[0].custom,'keep');assert.equal(edited.measurements[0].createdAt,1000);assert.equal(edited.measurements[0].weight,80);
  assert.throws(()=>saveBodyMeasurement(edited,{date:'2026-10-21',weight:'81'},ref,now),/zmienił/);
  assert.throws(()=>deleteBodyMeasurement(edited,ref),/zmienił/);
  const deleted=deleteBodyMeasurement(edited,measurementRef(edited.measurements,edited.measurements[0]));
  assert.equal(deleted.measurements.length,0);assert.deepEqual(deleted.legacyMeasurements,source.legacyMeasurements);
  const noId={measurements:[{date:'2026-10-20',biceps:37},{date:'unknown',custom:42}]};
  const assigned=saveBodyMeasurement(noId,{date:'2026-10-20',biceps:'38'},measurementRef(noId.measurements,noId.measurements[0]),now);
  assert.ok(assigned.measurements[0].id);assert.equal(assigned.measurements[1].custom,42);
});

test('comparison is exact by date, never fills missing values and latest readings retain their actual dates',()=>{
  const rows=[{date:'2026-10-28',waist:80,weight:82},{date:'2026-10-20',waist:84,bicepsRight:37},{date:'2026-10-28',bicepsLeft:38}];
  const old=bodyState(rows,'2026-10-20',true),recent=bodyState(rows,'2026-10-28',true);
  const comparison=compareBodyStates(old,recent);
  assert.equal(comparison.find(item=>item.key==='waist').delta,-4);
  assert.equal(comparison.find(item=>item.key==='bicepsRight').after,null);
  assert.equal(comparison.find(item=>item.key==='bicepsRight').delta,null);
  assert.equal(bodyState(rows,'2026-10-30').sources.bicepsRight.date,'2026-10-20');
  assert.equal(bodyState(rows,'2026-10-19').values.waist,null);
});

test('validation rejects blank, future, invalid and nonnumeric entries without changing the source',()=>{
  const source=initial(),before=JSON.stringify(source);
  for(const draft of [{date:'2026-10-30'},{date:'2026-11-01',weight:80},{date:'2026-02-30',weight:80},{date:'2026-10-30',weight:'bad'},{date:'2026-10-30',bodyFat:101},{date:'2026-10-30',waist:0}])assert.throws(()=>saveBodyMeasurement(source,draft,null,now));
  assert.equal(bodyNumber({bodyFat:0},'bodyFat'),0);assert.equal(bodyNumber({weight:null},'weight'),null);
  assert.equal(JSON.stringify(source),before);
});

const profile={model:'female',build:'athletic',heightCm:'170',goal:'muscle',targetWeight:'65',goalStartedOn:'2026-10-01'};
test('profile choices never infer sex or composition; goal revisions are additive, account-snapshot scoped and not duplicated',()=>{
  const source=initial(),first=saveBodyProfile(source,profile,{},now);
  assert.equal(first.bodyProfile.model,'female');assert.equal(first.bodyProfile.heightCm,170);
  assert.equal(first.bodyProfile.sex,undefined);assert.equal(first.bodyProfile.bodyFat,undefined);assert.equal(first.bodyProfile.weight,undefined);
  assert.equal(first.bodyGoalHistory.length,1);assert.equal(first.measurements,source.measurements);
  const second=saveBodyProfile(first,{...profile,heightCm:'171'},first.bodyProfile,now+1);
  assert.equal(second.bodyGoalHistory.length,1);
  const changed=saveBodyProfile(second,{...profile,goal:'maintain',targetWeight:'66',goalStartedOn:'2026-10-29'},second.bodyProfile,now+2);
  assert.equal(changed.bodyGoalHistory.length,2);assert.equal(changed.bodyGoalHistory[0].goal,'muscle');
  assert.throws(()=>saveBodyProfile(changed,profile,first.bodyProfile,now+3),/Profil zmienił/);
  const older=saveBodyProfile({...source,bodyProfile:{goal:'strength',heightCm:170}},profile,{goal:'strength',heightCm:170},now);
  assert.equal(older.bodyGoalHistory[0].changedAt,null);
  assert.throws(()=>saveBodyProfile(source,{...profile,goalStartedOn:''},{},now));
});

test('unsupported models never scale anatomy or infer muscles from mass; adapter inputs require height and matching circumferences',()=>{
  for(const model of ['male','female','neutral'])assert.equal(bodyModelCapabilities(model).canDeform,false);
  const before={values:{weight:70,waist:80,bicepsLeft:35}},after={values:{weight:100,waist:100,bicepsLeft:null}};
  const trend=prepareBodyTrend(before,after,{heightCm:180});
  assert.equal(trend.canApply,false);assert.deepEqual(trend.inputs.map(item=>item.key),['waist']);assert.equal(trend.inputs[0].boundedTrend,0.035);
  assert.equal(prepareBodyTrend(before,after,{}).inputs.length,0);
  assert.equal(prepareBodyTrend({values:{weight:70}},{values:{weight:100}},{heightCm:180}).inputs.length,0);
});
