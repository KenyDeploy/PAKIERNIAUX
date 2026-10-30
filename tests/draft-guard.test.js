import test from 'node:test';
import assert from 'node:assert/strict';
import React,{act,useState} from 'react';
import {Window} from 'happy-dom';
import {createServer} from 'vite';

test('draft close guard keeps original inputs mounted, blocks submission and restores edits; clean forms close directly',async()=>{
 const window=new Window({url:'http://localhost'});
 for(const key of ['window','document','navigator','HTMLElement','Event','FormData'])Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const server=await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
 let root,closed=0,submitted=0;
 try{
  const {DraftDialogSheet}=await server.ssrLoadModule('/src/DraftDialogSheet.jsx');
  function Harness(){const [value,setValue]=useState('');return React.createElement(DraftDialogSheet,{dirty:value!=='',labelledBy:'draft-test-title',onClose:()=>{closed++;},onSubmit:event=>{event.preventDefault();submitted++;}},requestClose=>React.createElement(React.Fragment,null,React.createElement('header',{className:'sheet-header'},React.createElement('h2',{id:'draft-test-title'},'Formularz'),React.createElement('button',{type:'button',onClick:requestClose},'Zamknij formularz')),React.createElement('div',{className:'sheet-body'},React.createElement('input',{name:'draft',value,onChange:event=>setValue(event.target.value)}))));}
  const {createRoot}=await import('react-dom/client');const container=document.createElement('div');document.body.append(container);root=createRoot(container);await act(()=>root.render(React.createElement(Harness)));
  const button=name=>[...container.querySelectorAll('button')].find(el=>el.textContent===name);
  await act(()=>button('Zamknij formularz').click());assert.equal(closed,1);assert.equal(container.querySelector('#draft-test-title-draft-close'),null);
  const input=container.querySelector('input');await act(()=>{const set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;set.call(input,'wpisane');input.dispatchEvent(new window.Event('input',{bubbles:true}));input.dispatchEvent(new window.Event('change',{bubbles:true}));});
  await act(()=>button('Zamknij formularz').click());assert.ok(container.querySelector('#draft-test-title-draft-close'));assert.equal(input,container.querySelector('input'));assert.equal(input.value,'wpisane');assert.equal(closed,1);
  await act(()=>container.querySelector('form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true})));assert.equal(submitted,0);
  await act(()=>button('Kontynuuj edycję').click());assert.equal(container.querySelector('#draft-test-title-draft-close'),null);assert.equal(input.value,'wpisane');
  await act(()=>container.querySelector('.sheet-backdrop').dispatchEvent(new window.Event('pointerdown',{bubbles:true})));assert.ok(button('Odrzuć szkic'));
  await act(()=>container.querySelector('[role=dialog]').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));assert.equal(container.querySelector('#draft-test-title-draft-close'),null);assert.equal(closed,1);assert.equal(input.value,'wpisane');
  await act(()=>button('Zamknij formularz').click());await act(()=>button('Odrzuć szkic').click());assert.equal(closed,2);
 }finally{if(root)await act(()=>root.unmount());await server.close();window.happyDOM.abort();}
});
