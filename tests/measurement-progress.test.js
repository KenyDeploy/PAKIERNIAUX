import test from 'node:test';
import assert from 'node:assert/strict';
import {measurementProgress} from '../src/measurementProgress.js';

test('metric progress uses actual dated values, ignores omissions/future/legacy opposite sides',()=>{
 const rows=[{date:'2026-10-01',waist:90},{date:'2026-10-10',weight:80,biceps:35},{date:'2026-10-20',waist:86},{date:'2026-10-30',waist:84},{date:'2099-01-01',waist:999}];
 const before=JSON.stringify(rows),p=measurementProgress(rows,'waist','2026-10-30');
 assert.equal(p.value,84);assert.equal(p.deltaPrevious,-2);assert.equal(p.deltaStart,-6);assert.equal(p.latest.date,'2026-10-30');assert.equal(p.readings.length,3);
 assert.equal(measurementProgress(rows,'bicepsRight','2026-10-30').value,null);
 assert.equal(JSON.stringify(rows),before);
});
test('previous record on the same day retains its own value and baseline, without latest-value leakage',()=>{
 const rows=[{id:'new',date:'2026-10-30',createdAt:2,chest:102},{id:'old',date:'2026-10-30',createdAt:1,chest:101},{id:'start',date:'2026-10-01',chest:100}];
 const p=measurementProgress(rows,'chest','2026-10-30');
 const previous=measurementProgress(rows,'chest','2026-10-30',p.previous);
 assert.equal(previous.value,101);assert.equal(previous.deltaPrevious,1);assert.equal(previous.deltaStart,1);
 assert.equal(measurementProgress([], 'waist','2026-10-30').deltaStart,null);
 const first=measurementProgress([{date:'2026-10-01',waist:90}],'waist','2026-10-30');
 assert.equal(first.deltaPrevious,null);assert.equal(first.deltaStart,0);
});
