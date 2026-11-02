import test from 'node:test';
import assert from 'node:assert/strict';
import { exerciseHistory, historySetLabel, historyVolumeLabel } from '../src/exerciseHistory.js';

const row = (weight, reps, extra = {}) => ({weight, reps, completed:true, ...extra});
const workout = (id, date, sets, extra = {}) => ({id, completedAt:date, exercises:[{id:7, name:'Dawna nazwa', sets}], ...extra});
const saved = [
  workout('old', new Date(2026,9,20,12).getTime(), [row('60','8')]),
  workout('latest', new Date(2026,9,28,12).getTime(), [row('70','8'),row('100','8',{completed:false}),row('80','8'),row('500','20',{skipped:true}),row('80','6'),row('bad','8'),row('20','0')]),
];

test('exercise history uses IDs, completion dates and only confirmed, valid, unskipped sets without mutation', () => {
  const source = [...saved,
    workout('draft',null,[row('999','10')]),
    workout('invalid-date','bad date',[row('999','10')]),
    workout('out-of-range-date',1e20,[row('999','10')]),
    workout('empty',Date.now(),[row('999','10',{completed:false})]),
    workout('other-id',Date.now(),[],{exercises:[{id:8,name:'Dawna nazwa',sets:[row('999','10')]}]}),
    workout('skipped-exercise',Date.now(),[],{exercises:[{id:7,skipped:true,sets:[row('999','10')]}]}),
  ];
  const before=JSON.stringify(source);
  const result=exerciseHistory(source,7);
  assert.deepEqual(result.map(s=>s.sessionId),['latest','old']);
  assert.deepEqual(result[0].sets.map(s=>s.index),[1,3,5]);
  assert.equal(result[0].volume,1680);
  assert.equal(result[1].volume,480);
  assert.deepEqual(exerciseHistory(source,999),[]);
  assert.equal(JSON.stringify(source),before);
});

test('missing load and zero additional load are distinct and never presented as invented weight', () => {
  const sessions=exerciseHistory([workout('mixed',Date.now(),[row(null,'12'),row('','10'),row('0','8'),row('22,5','8')])],7);
  assert.match(historySetLabel(sessions[0].sets[0]),/12 powt.*bez zapisanego ciężaru/);
  assert.doesNotMatch(historySetLabel(sessions[0].sets[0]),/kg/);
  assert.match(historySetLabel(sessions[0].sets[2]),/bez dodatkowego obciążenia/);
  assert.equal(historySetLabel(sessions[0].sets[3]),'22,5 kg × 8');
  assert.equal(sessions[0].volume,180);
  assert.match(historyVolumeLabel(sessions[0]),/serii z zapisanym ciężarem: 180 kg/);
  const noLoad=exerciseHistory([workout('bodyweight',Date.now(),[row(undefined,'12')])],7)[0];
  assert.match(historyVolumeLabel(noLoad),/Brak zapisanego obciążenia/);
});

test('history is ordered by actual completion, not start time or array position', () => {
  const result=exerciseHistory([workout('a','2026-10-20T12:00:00Z',[row('10','8')],{startedAt:999999}),workout('b','2026-10-28T12:00:00Z',[row('20','8')],{startedAt:1})],7);
  assert.equal(result[0].sessionId,'b');
});

test('exercise time comes only from the performed exercise, never the whole workout', () => {
  const session=workout('timed',Date.now(),[row('20','8')],{durationSeconds:9999});
  assert.equal(exerciseHistory([session],7)[0].durationSeconds,null);
  session.exercises[0].durationSeconds=45;
  assert.equal(exerciseHistory([session],7)[0].durationSeconds,45);
  session.exercises[0].durationSeconds=0;
  assert.equal(exerciseHistory([session],7)[0].durationSeconds,0);
  for(const invalid of [null,'45',NaN,-1]) {
    session.exercises[0].durationSeconds=invalid;
    assert.equal(exerciseHistory([session],7)[0].durationSeconds,null);
  }
});

test('history sheet selects earlier sessions, closes with Escape, restores focus and shows empty state', async () => {
  const {Window}=await import('happy-dom');
  const React=await import('react');
  const window=new Window({url:'http://localhost:5173'});
  for(const key of ['window','document','navigator','HTMLElement','Event','MouseEvent','KeyboardEvent']) Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  const {createRoot}=await import('react-dom/client');
  const {createServer}=await import('vite');
  const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
  let root;
  try {
    const {ExerciseHistorySheet}=await server.ssrLoadModule('/src/ExerciseHistorySheet.jsx');
    const opener=document.createElement('button'); document.body.append(opener); opener.focus();
    const container=document.createElement('div'); document.body.append(container); root=createRoot(container);
    let closed=0,progress=0;
    const older=Array.from({length:5},(_,index)=>workout('older-'+index,new Date(2026,8,10-index,12).getTime(),[row('10','8')]));
    const props={exercise:{id:7,name:'Nowa nazwa ćwiczenia'},sessions:exerciseHistory([...saved,...older],7),onClose:()=>closed++,onProgress:()=>progress++};
    await React.act(()=>root.render(React.createElement(ExerciseHistorySheet,props)));
    assert.match(container.textContent,/Nowa nazwa ćwiczenia/);
    assert.match(container.querySelector('#exercise-history-title').textContent,/28.10.2026/);
    assert.equal(container.querySelectorAll('.workout-history-set').length,3);
    assert.equal(container.querySelectorAll('.exercise-history-sessions button').length,5);
    assert.equal(container.querySelector('.history-exercise-time'),null);
    assert.match(container.querySelector('.history-volume').textContent,/1680 kg/);
    await React.act(()=>container.querySelectorAll('.exercise-history-sessions button')[1].click());
    assert.match(container.querySelector('#exercise-history-title').textContent,/20.10.2026/);
    assert.match(container.querySelector('.workout-history-set').textContent,/60 kg × 8/);
    assert.match(container.querySelector('.history-volume').textContent,/480 kg/);
    await React.act(()=>container.querySelector('.sheet-footer button').click());assert.equal(progress,1);
    await React.act(()=>container.querySelector('[role="dialog"]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(closed,1);
    await React.act(()=>root.unmount());assert.equal(document.activeElement,opener);
    root=createRoot(container);
    await React.act(()=>root.render(React.createElement(ExerciseHistorySheet,{...props,sessions:[]})));
    assert.match(container.textContent,/Nie masz jeszcze zapisanych wyników/);
    assert.equal(container.querySelectorAll('.workout-history-set').length,0);
    assert.doesNotMatch(container.querySelector('#exercise-history-title').textContent,/\d{2}\.\d{2}\.\d{4}/);
    await React.act(()=>container.querySelector('[aria-label="Zamknij historię ćwiczenia"]').click());assert.equal(closed,2);
  } finally { if(root)await React.act(()=>root.unmount()); await server.close(); window.happyDOM.abort(); }
});
