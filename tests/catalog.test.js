import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { catalog, starterExercises } from '../src/catalog.js';
import { exercisePhotoStyle } from '../src/exercisePhotos.js';
import { normalizeData } from '../src/training.js';

const library = [...starterExercises, ...catalog];
test('72 distinct exercises cover seven muscle groups, six equipment types and real image assets', () => {
  assert.equal(library.length,72);
  assert.equal(new Set(library.map(e=>e.id)).size,72);
  assert.equal(new Set(library.map(e=>e.name)).size,72);
  assert.equal(new Set(library.map(e=>e.category)).size,7);
  assert.equal(new Set(library.map(e=>e.equipment)).size,6);
  const slots=new Set();
  for(const exercise of library){
    assert.ok(exercise.sets>0 && exercise.reps>0 && exercise.rest>=0,exercise.name);
    const photo=exercisePhotoStyle(exercise);
    assert.ok(photo,exercise.name);
    const filename=photo.backgroundImage.match(/url\("\/([^\"]+)"\)/)[1];
    assert.ok(existsSync(new URL(`../public/${filename}`,import.meta.url)),`Missing photo: ${exercise.name}/${filename}`);
    slots.add(`${filename}:${photo.backgroundPosition}`);
  }
  assert.equal(slots.size,72,'Each exercise needs its own photo, not a generic group image');
  assert.equal(exercisePhotoStyle({id:1,name:'Moje nowe ćwiczenie'}),null);
});

test('catalogue upgrade keeps custom data and settings; subsequent deletions stay deleted', () => {
  const saved={exercises:[{...starterExercises[0],sets:5,rest:0},{id:999,name:'Moje ćwiczenie',category:'Plecy',equipment:'Maszyna'}],plans:[{id:99,exercises:[1,999]}]};
  const upgraded=normalizeData(saved,{exercises:library});
  assert.equal(upgraded.exercises.length,73);
  assert.equal(upgraded.exercises.find(e=>e.id===1).sets,5);
  assert.equal(upgraded.exercises.find(e=>e.id===1).rest,0);
  assert.deepEqual(upgraded.plans,saved.plans);
  upgraded.exercises=upgraded.exercises.filter(e=>e.id!==100);
  assert.equal(normalizeData(upgraded,{exercises:library}).exercises.some(e=>e.id===100),false);
  assert.deepEqual(normalizeData({exercises:[]},{exercises:library}).exercises,[]);
});
