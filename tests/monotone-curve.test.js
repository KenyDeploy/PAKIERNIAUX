import test from 'node:test';import assert from 'node:assert/strict';
import {monotonePath} from '../src/monotoneCurve.js';
import {exerciseChartPoints,workoutVolumePoints} from '../src/chartData.js';
import {exerciseHistory} from '../src/exerciseHistory.js';
test('shape-preserving curves pass through all observations and never exceed segment bounds',()=>{
 for(const uneven of [false,true])for(const values of [[1,2,3,10],[10,1,8,2],[4,4,4],[0,100,0],[1,1,2,2,0]]){
  const points=values.map((y,x)=>({x:(uneven?x*x:x)*10,y})),path=monotonePath(points),segments=[...path.matchAll(/C ([\d.e+-]+) ([\d.e+-]+), ([\d.e+-]+) ([\d.e+-]+), ([\d.e+-]+) ([\d.e+-]+)/g)];
  assert.equal(segments.length,values.length-1);
  segments.forEach((m,i)=>{const a=points[i],b=points[i+1],c1=+m[2],c2=+m[4];assert.equal(+m[5],b.x);assert.equal(+m[6],b.y);for(let j=0;j<=100;j++){const t=j/100,y=(1-t)**3*a.y+3*(1-t)**2*t*c1+3*(1-t)*t*t*c2+t**3*b.y;assert.ok(y>=Math.min(a.y,b.y)-.001 && y<=Math.max(a.y,b.y)+.001);}});
 }
 assert.equal(monotonePath([]),'');assert.equal(monotonePath([{x:0,y:4}]),'');
});
test('chart projections never turn missing weight into zero or include unconfirmed/skipped results',()=>{
 const workout={id:'w',completedAt:Date.now()-1000,exercises:[{id:1,sets:[{weight:null,reps:8,completed:true},{weight:999,reps:8,completed:false}]}]};
 const sessions=exerciseHistory([workout],1);assert.deepEqual(exerciseChartPoints(sessions),[]);assert.deepEqual(exerciseChartPoints(sessions,'volume'),[]);assert.deepEqual(workoutVolumePoints([workout]),[]);
 workout.exercises[0].sets.push({weight:0,reps:8,completed:true});assert.equal(workoutVolumePoints([workout])[0].value,0);
 workout.exercises[0].sets.push({weight:20,reps:8,completed:true});assert.equal(workoutVolumePoints([workout])[0].value,160);
});
