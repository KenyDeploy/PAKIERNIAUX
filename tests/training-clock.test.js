import test from 'node:test';
import assert from 'node:assert/strict';
import {workoutElapsedSeconds,pauseWorkoutClock,resumeWorkoutClock,startSessionRest,restRemainingSeconds,pauseSessionRest,resumeSessionRest,extendSessionRest,skipSessionRest} from '../src/trainingClock.js';
import {completeSession,normalizeData} from '../src/training.js';

const initial=()=>({id:'clock-session',startedAt:1000,index:0,plan:{id:1,exercises:[1]},exercises:[{id:1,name:'Ruch',sets:[{weight:'20',reps:'8',completed:true}]}]});
test('paused rest preserves exact remaining time through reload, extension and resume',()=>{
  const running=startSessionRest(initial(),90,'Ruch',1000);
  const paused=pauseSessionRest(running,2550);
  assert.equal(paused.restPausedRemainingMs,88450);
  assert.equal(paused.restUntil,null);
  assert.equal(pauseSessionRest(paused,5000),paused);
  assert.equal(restRemainingSeconds(paused,900000),89);
  const restored=normalizeData(JSON.parse(JSON.stringify({activeSession:paused})),{}).activeSession;
  const extended=extendSessionRest(restored,15,900000);
  assert.equal(extended.restPausedRemainingMs,103450);
  assert.equal(extended.restUntil,null);
  const resumed=resumeSessionRest(extended,901000);
  assert.equal(resumed.restUntil,1004450);
  assert.equal(resumed.restPausedRemainingMs,null);
  assert.equal(resumeSessionRest(resumed,902000),resumed);
  assert.equal(restRemainingSeconds(resumed,902000),103);
  assert.equal(restRemainingSeconds(skipSessionRest(extended),902000),0);
  assert.equal(startSessionRest(extended,150,'Ruch',902000).restPausedRemainingMs,null);
  assert.equal(workoutElapsedSeconds(extended,900000),899,'Rest pause never pauses the workout');
  assert.equal(pauseSessionRest(running,100000),running,'Expired rest must not be revived by pause');
});
test('workout pause/resume is persistent, idempotent and excludes all paused time at completion',()=>{
  const s=initial();
  const paused=pauseWorkoutClock(s,61000);
  assert.equal(workoutElapsedSeconds(paused,301000),60);
  assert.equal(pauseWorkoutClock(paused,301000),paused);
  const restored=normalizeData(JSON.parse(JSON.stringify({activeSession:paused})),{}).activeSession;
  assert.equal(workoutElapsedSeconds(restored,601000),60);
  const resumed=resumeWorkoutClock(restored,301000);
  assert.equal(resumed.pausedDurationMs,240000);
  assert.equal(resumeWorkoutClock(resumed,400000),resumed);
  assert.equal(workoutElapsedSeconds(resumed,361000),120);
  const secondPause=pauseWorkoutClock(resumed,361000);
  assert.equal(completeSession(secondPause,721000).durationSeconds,120);
  const secondResume=resumeWorkoutClock(secondPause,421000);
  assert.equal(completeSession(secondResume,481000).durationSeconds,180);
  assert.equal(s.pausedAt,undefined);
});

test('rest deadline and workout clock are independent across pauses, refresh and long background gaps',()=>{
  const running=startSessionRest(initial(),90,'Ruch',61000);
  assert.equal(restRemainingSeconds(running,61000),90);
  const paused=pauseWorkoutClock(running,62000);
  const restored=JSON.parse(JSON.stringify(paused));
  assert.equal(restRemainingSeconds(restored,91000),60);
  assert.equal(workoutElapsedSeconds(restored,91000),61);
  assert.equal(restRemainingSeconds(restored,991000),0);
  assert.equal(workoutElapsedSeconds(restored,991000),61);
  const unpaused=resumeWorkoutClock(restored,992000);
  assert.equal(workoutElapsedSeconds(unpaused,1052000),121);
  assert.equal(workoutElapsedSeconds(initial(),601000),600);
  assert.equal(restRemainingSeconds(startSessionRest(initial(),0,'Ruch',1000),1000),0);
  assert.throws(()=>startSessionRest(initial(),-1,'Ruch'));
  assert.throws(()=>startSessionRest(initial(),NaN,'Ruch'));
});

test('legacy sessions without timer fields keep their original duration and unrelated data',()=>{
  const s={...initial(),customField:{keep:true},restUntil:12345};
  assert.equal(completeSession(s,61000).durationSeconds,60);
  assert.deepEqual(resumeWorkoutClock(pauseWorkoutClock(s,31000),41000).customField,{keep:true});
  assert.equal(resumeWorkoutClock(pauseWorkoutClock(s,31000),41000).restUntil,12345);
});
