import test from 'node:test';
import assert from 'node:assert/strict';
import { isCustomPhoto, MAX_PHOTO_DATA_LENGTH, prepareExercisePhoto } from '../src/photoUpload.js';
import { exercisePhotoStyle } from '../src/exercisePhotos.js';
import { createSession, completeSession } from '../src/training.js';

test('custom photos accept bounded JPEG data and reject external URLs or active formats', async () => {
 const photo='data:image/jpeg;base64,/9j/';
 assert.equal(isCustomPhoto(photo),true);
 for(const value of ['https://example.com/photo.jpg','data:image/svg+xml;base64,PHN2Zz4=',null,'data:image/jpeg;base64,'+'A'.repeat(MAX_PHOTO_DATA_LENGTH)]) assert.equal(isCustomPhoto(value),false);
 assert.equal(exercisePhotoStyle({name:'Moje ćwiczenie',customPhoto:photo}).backgroundSize,'cover');
 await assert.rejects(prepareExercisePhoto(new File(['test'],'test.pdf',{type:'application/pdf'})),/JPG/);
 await assert.rejects(prepareExercisePhoto(new File([],'empty.jpg',{type:'image/jpeg'})),/10 MB/);
});
test('workout history keeps results without duplicating exercise photos', () => {
 const photo='data:image/jpeg;base64,/9j/';
 const exercise={id:77,name:'Moje ćwiczenie',customPhoto:photo,sets:1,reps:8,rest:0};
 const session=createSession({id:1,name:'Mój plan',exercises:[77]},[exercise],[],1000);
 session.exercises[0].sets[0]={weight:'20',reps:'8',completed:true};
 const saved=completeSession(session,61000);
 assert.equal(saved.volume,160);
 assert.equal(saved.exercises[0].customPhoto,undefined);
 assert.equal(exercise.customPhoto,photo);
});
