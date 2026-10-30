import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { Window } from 'happy-dom';
import { createServer } from 'vite';

test('UI saves real sets, restores a draft, updates history, chart and body changes', async () => {
  const window = new Window({url:'http://localhost:5173'});
  for(const key of ['window','document','navigator','localStorage','HTMLElement','HTMLInputElement','Event','MouseEvent','FormData']) Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');
  const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  let root;
  try {
    const {default:App} = await server.ssrLoadModule('/src/App.jsx');
    const container = document.createElement('div');document.body.append(container);
    root=createRoot(container);await act(()=>root.render(React.createElement(App)));
    const button = name => [...container.querySelectorAll('button')].find(b=>(b.getAttribute('aria-label') || b.textContent.trim())===name);
    const click = async name => {const b=button(name);assert.ok(b,`Missing button: ${name}`);await act(()=>b.click());};
    const input = async (selector,value) => {const el=container.querySelector(selector);assert.ok(el,selector);await act(()=>{const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(el,value);el.dispatchEvent(new window.Event('input',{bubbles:true}));el.dispatchEvent(new window.Event('change',{bubbles:true}));});};
    // CTA includes subtitle, so use its class to start.
    await act(()=>container.querySelector('.primary-cta').click());
    await input('[aria-label="Ciężar serii 1"]','22,5');
    await input('[aria-label="Powtórzenia serii 1"]','8');
    await click('Zatwierdź serię 1');await click('Dodaj serię');
    assert.equal(container.querySelectorAll('.set-row').length,1);
    let data=JSON.parse(localStorage.getItem('pakiernia.v2.local')).data;
    assert.equal(data.activeSession.exercises[0].sets[0].weight,'22,5');
    assert.equal(data.activeSession.exercises[0].sets[0].completed,true);
    await act(()=>root.unmount());root=createRoot(container);await act(()=>root.render(React.createElement(App)));
    await act(()=>container.querySelector('.secondary-cta').click());
    await click('Popraw serię 1');
    assert.equal(container.querySelector('[aria-label="Ciężar serii 1"]').value,'22,5');
    await click('Następne');await click('Następne');await click('Następne');await click('Zakończ');await click('Zapisz trening');
    data=JSON.parse(localStorage.getItem('pakiernia.v2.local')).data;
    assert.equal(data.workouts.length,1);assert.equal(data.workouts[0].volume,180);
    assert.equal(data.activeSession,null);assert.match(container.textContent,/Dobra robota/);
    await click('Postęp');assert.match(container.querySelector('.chart-value').textContent,/22,5/);
    await click('Pomiary');
    for(const [date,biceps] of [['2026-10-22','37'],['2026-10-29','38']]) {
      await input('input[name="date"]',date);await input('input[name="biceps"]',biceps);
      await act(()=>container.querySelector('.measurement-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));
    }
    assert.match(container.querySelector('.body-metrics').textContent,/\+1 cm od poprzedniego/);
  } finally {if(root)await act(()=>root.unmount());await server.close();window.happyDOM.abort();}
});
