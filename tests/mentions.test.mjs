import test from 'node:test';
import assert from 'node:assert/strict';
import {mentionMarkup} from '../assets/mentions.js';
const members=[{id:'dain',name:'데인',board:'staff'},{id:'jaein',name:'재인',board:'lucky'}];
test('Mentions link known members, preserve punctuation and escape all user input',()=>{
 const text=mentionMarkup('@데인, @재인! <img src=x onerror=alert(1)>',members);
 assert.match(text,/board=staff&member=dain/);assert.match(text,/@재인<\/a>!/);assert.ok(!text.includes('<img'));assert.match(text,/&lt;img/);
 assert.equal(mentionMarkup('a@데인.com @데인가짜 @아무개',members),'a@데인.com @데인가짜 @아무개');
 assert.ok(!mentionMarkup('@데인',members,false).includes('<a'));
});
