'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { createServer } = require('../src/server');

test('web server serves only public app files', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const [url,type] of [['/','text/html'],['/app.js','text/javascript'],['/styles.css','text/css']]) {
      const response = await fetch(base+url);
      assert.equal(response.status,200);
      assert.ok(response.headers.get('content-type').startsWith(type));
      assert.ok((await response.text()).length>0);
    }
    assert.equal((await fetch(base+'/package.json')).status,404);
    assert.equal((await fetch(base+'/src/pathway.js')).status,404);
    assert.equal((await fetch(base+'/',{method:'POST'})).status,404);
  } finally { await new Promise(resolve=>server.close(resolve)); }
});
function demo() {
  const handlers={};
  const app={innerHTML:'',addEventListener:(event,callback)=>{handlers[event]=callback;}};
  const error={hidden:true,textContent:''};
  const storage=()=>{const values=new Map();return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,String(value)),removeItem:key=>values.delete(key)};};
  const localStorage=storage(),sessionStorage=storage();
  const context=vm.createContext({document:{querySelector:selector=>selector==='#app'?app:error},localStorage,sessionStorage,location:{get hash(){return this.value||'';},set hash(value){this.value=value.startsWith('#')?value:'#'+value;}},window:{addEventListener:(event,callback)=>{handlers[event]=callback;},scrollTo:()=>{}},FormData:class{constructor(form){return Object.entries(form.values);}}});
  vm.runInContext(fs.readFileSync(require.resolve('../public/app.js'),'utf8'),context);
  function route(name){context.location.hash='#'+name;handlers.hashchange();}
  function submit(kind,values){const before=context.location.hash;handlers.submit({preventDefault(){},target:{closest:()=>({dataset:{form:kind},values})}});if(context.location.hash!==before)handlers.hashchange();}
  return {app,error,localStorage,sessionStorage,route,submit,handlers};
}
test('demo sign in, escaped profile edits, preferences, and stored state',()=>{
  const d=demo();
  assert.match(d.app.innerHTML,/Welcome back/);
  d.submit('login',{email:'demo@example.edu',password:'demo'});
  assert.match(d.app.innerHTML,/Hi, James/);
  d.submit('profile',{name:'<script>alert(1)</script>',major:'Math',concentration:'Statistics',graduation:'May 2028',year:'Junior',gpa:'3.8',goal:'Analyst'});
  assert.match(d.app.innerHTML,/&lt;script&gt;/);
  assert.doesNotMatch(d.app.innerHTML,/<script>alert/);
  assert.equal(JSON.parse(d.localStorage.getItem('gradpath.profile')).major,'Math');
  d.route('preferences');d.submit('preferences',{schedule:'Evening',work:'Full-time'});
  assert.match(d.app.innerHTML,/Preferences saved/);
  d.route('profile');assert.match(d.app.innerHTML,/Evening classes/);
  d.route('class-detail');
  d.handlers.click({target:{closest:()=>({dataset:{action:'add-course'}})}});d.handlers.hashchange();
  assert.match(d.app.innerHTML,/Class added/);
  assert.equal(d.localStorage.getItem('gradpath.planned'),'true');
  assert.equal(d.localStorage.getItem('password'),null);
});
test('signup rejects mismatched passwords and protected routes require a demo session',()=>{
  const d=demo();
  d.route('profile');assert.equal(d.sessionStorage.getItem('gradpath.session'),null);
  d.route('signup');
  d.handlers.submit({preventDefault(){},target:{closest:()=>({dataset:{form:'signup'},values:{name:'Student',password:'abcdefgh',confirm:'different'}})}});
  assert.equal(d.error.hidden,false);
  assert.match(d.error.textContent,/Passwords must match/);
  assert.equal(d.sessionStorage.getItem('gradpath.session'),null);
  d.route('reset');d.submit('reset',{email:'demo@example.edu'});
  assert.match(d.app.innerHTML,/No email was sent/);
});
