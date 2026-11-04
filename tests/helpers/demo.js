'use strict';
// Loads the browser scripts into a fake browser so tests can drive the demo app.
const fs = require('node:fs');
const vm = require('node:vm');

const SCRIPTS = ['catalog.js', 'classes.js', 'schedule.js', 'ratings.js', 'career.js', 'app.js'];

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
}

function demo(options = {}) {
  const handlers = {};
  const app = { innerHTML: '', addEventListener: (event, callback) => { handlers[event] = callback; } };
  const error = { hidden: true, textContent: '' };
  const localStorage = options.localStorage || storage();
  const sessionStorage = storage();
  const context = vm.createContext({
    document: { querySelector: selector => selector === '#app' ? app : error },
    localStorage, sessionStorage,
    location: { get hash() { return this.value || ''; }, set hash(value) { this.value = value.startsWith('#') ? value : '#' + value; } },
    window: { addEventListener: (event, callback) => { handlers[event] = callback; }, scrollTo: () => {} },
    FormData: class { constructor(form) { return Object.entries(form.values); } }
  });
  for (const name of SCRIPTS) vm.runInContext(fs.readFileSync(require.resolve('../../public/' + name), 'utf8'), context);

  function route(name) { context.location.hash = '#' + name; handlers.hashchange(); }
  function submit(kind, values) {
    const before = context.location.hash;
    handlers.submit({ preventDefault() {}, target: { closest: () => ({ dataset: { form: kind }, values }) } });
    if (context.location.hash !== before) handlers.hashchange();
  }
  function click(action, data = {}) {
    const before = context.location.hash;
    handlers.click({ target: { closest: () => ({ dataset: { action, ...data } }) } });
    if (context.location.hash !== before) handlers.hashchange();
  }
  function signIn() { submit('login', { email: 'demo@example.edu', password: 'demo' }); }
  return { app, error, localStorage, sessionStorage, route, submit, click, signIn, handlers };
}

module.exports = { demo };
