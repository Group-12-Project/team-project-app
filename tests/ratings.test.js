'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { demo } = require('./helpers/demo');

function signedIn(options) { const d = demo(options); d.signIn(); return d; }

test('ratings list and class ratings show the sample reviews and average', () => {
  const d = signedIn();
  d.route('ratings');
  assert.match(d.app.innerHTML, /4\.5 out of 5 · 2 student reviews/);
  d.route('rating-detail/database-systems');
  assert.match(d.app.innerHTML, /Database Systems ratings/);
  assert.match(d.app.innerHTML, /Based on 2 student reviews/);
  assert.match(d.app.innerHTML, /SQL exercises were useful/);
});

test('searching ratings finds classes, including ones with no reviews', () => {
  const d = signedIn();
  d.route('ratings');
  d.submit('rating-search', { q: 'web' });
  assert.match(d.app.innerHTML, /Advanced Web Development/);
  assert.match(d.app.innerHTML, /No reviews yet/);
  d.submit('rating-search', { q: 'zzz' });
  assert.match(d.app.innerHTML, /No ratings found/);
  d.click('rating-clear');
  assert.match(d.app.innerHTML, /Database Systems/);
});

test('writing a review: rating first, then text, then posted with a new average', () => {
  const d = signedIn();
  d.route('rating-write/database-systems');
  assert.match(d.app.innerHTML, /Select a rating/);
  assert.doesNotMatch(d.app.innerHTML, /Post review/, 'no post button until a rating is chosen');

  d.click('rating-star', { value: '5' });
  assert.match(d.app.innerHTML, /5 out of 5/);
  assert.match(d.app.innerHTML, /Post review/);

  d.submit('rating-post', { review: '   ' });
  assert.match(d.app.innerHTML, /Add a short review before posting/);

  d.submit('rating-post', { review: 'Great class, <b>loved</b> the project.' });
  assert.match(d.app.innerHTML, /Review posted/);
  assert.match(d.app.innerHTML, /4\.7 out of 5/);
  assert.match(d.app.innerHTML, /Based on 3 student reviews/);
  assert.match(d.app.innerHTML, /Your review · 5 out of 5/);
  assert.doesNotMatch(d.app.innerHTML, /<b>loved/, 'review text is escaped');

  d.route('rating-detail/database-systems');
  assert.match(d.app.innerHTML, /Based on 3 student reviews/);
});

test('posting without a rating is rejected', () => {
  const d = signedIn();
  d.route('rating-write/database-systems');
  d.submit('rating-post', { review: 'Nice' });
  assert.match(d.app.innerHTML, /Choose a rating before posting/);
});

test('malformed stored reviews are ignored and blocked storage does not break posting', () => {
  const d = demo();
  d.localStorage.setItem('gradpath.reviews', '[{"classId":"database-systems","rating":99,"text":"x"}, "oops"]');
  d.signIn();
  d.route('rating-detail/database-systems');
  assert.match(d.app.innerHTML, /Based on 2 student reviews/);

  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {} };
  const b = signedIn({ localStorage: blocked });
  b.route('rating-write/database-systems');
  b.click('rating-star', { value: '4' });
  b.submit('rating-post', { review: 'Still works.' });
  assert.match(b.app.innerHTML, /Review posted/);
});

test('unknown class in ratings shows a not-found page', () => {
  const d = signedIn();
  d.route('rating-detail/nope');
  assert.match(d.app.innerHTML, /Class not found/);
});
