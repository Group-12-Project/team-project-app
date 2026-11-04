'use strict';
// Course ratings area: Ratings (W24), Ratings detail (W25),
// Write a review (W26, W27), Review posted (W28).
// Sample reviews are fictional. Reviews you post are stored in localStorage.
(function (root) {
  const C = root.GradPathCatalog;
  const KEY = 'gradpath.reviews';
  const MAX_REVIEW = 500;

  const SAMPLE = {
    'database-systems': [
      { rating: 5, text: 'The SQL exercises were useful, and the project helped me understand database design.' },
      { rating: 4, text: 'Helpful material. Start the project early and leave time for testing.' }
    ]
  };

  // ---- posted reviews (with an in-memory fallback when storage is blocked or malformed) ----
  let memory = null;
  const valid = (r) => r && typeof r.classId === 'string' && C.find(r.classId) &&
    Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5 && typeof r.text === 'string';
  function mine() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(stored)) return stored.filter(valid);
    } catch { /* blocked or malformed */ }
    return memory ? memory.slice() : [];
  }
  function saveMine(list) {
    memory = list.slice();
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* keep the in-memory copy */ }
  }
  const reviewsFor = (id) => [...(SAMPLE[id] || []), ...mine().filter((r) => r.classId === id)];
  function stats(id) {
    const list = reviewsFor(id);
    const average = list.length ? Math.round((list.reduce((sum, r) => sum + r.rating, 0) / list.length) * 10) / 10 : null;
    return { count: list.length, average };
  }
  const reviewCount = (n) => `Based on ${n} student review${n === 1 ? '' : 's'}`;

  const state = { query: '' };
  const draft = { classId: '', rating: 0, text: '', error: '' };
  const resetDraft = (classId) => Object.assign(draft, { classId, rating: 0, text: '', error: '' });

  const aside = (ui) =>
    ui.card('Student perspectives', 'Ratings reflect individual experiences. Use them alongside course descriptions and advising.') +
    ui.card('Share your experience', 'Help other students by posting a short, respectful review.', 'rating-write/database-systems', 'Write a review →');

  function index(ui) {
    const q = state.query.toLowerCase();
    const classes = C.classes.filter((c) => c.listed && (q ? c.title.toLowerCase().includes(q) : stats(c.id).count > 0));
    const cards = classes.map((c) => {
      const { count, average } = stats(c.id);
      return count
        ? ui.card(c.title, `${average.toFixed(1)} out of 5 · ${count} student review${count === 1 ? '' : 's'}`, `rating-detail/${c.id}`, 'Read reviews →')
        : ui.card(c.title, 'No reviews yet.', `rating-write/${c.id}`, 'Be the first to review →');
    }).join('');
    const empty = classes.length ? '' : ui.card('No ratings found', 'Try a different class title.');
    const clear = q ? `<button class="button secondary" type="button" data-action="rating-clear">Clear search</button>` : '';
    return `<h1>Course ratings</h1>` + ui.columns(
      `<form class="stack" data-form="rating-search">${ui.field('Search course ratings', 'q', state.query, 'search', 'Search by class title', 'autocomplete="off" maxlength="80"')}</form>` + cards + empty + clear,
      aside(ui)
    );
  }

  function detail(c, ui) {
    const { count, average } = stats(c.id);
    const summary = count
      ? ui.card(`${average.toFixed(1)} out of 5`, reviewCount(count))
      : ui.card('No reviews yet', 'Be the first to share your experience.');
    const reviews = reviewsFor(c.id).map((r) => ui.card(`${r.rating} out of 5`, r.text, '', 'Student review')).join('');
    return `<h1>${ui.esc(c.title)} ratings</h1>` + ui.columns(
      summary + reviews + ui.link('Write a review', `rating-write/${c.id}`, 'primary') + ui.link('View class details', `class-detail/${c.id}`, 'secondary'),
      aside(ui)
    );
  }

  function write(c, ui) {
    if (draft.classId !== c.id) resetDraft(c.id);
    const star = (n) => `<button class="star" type="button" data-action="rating-star" data-value="${n}" aria-label="${n} out of 5" aria-pressed="${draft.rating >= n}">${draft.rating >= n ? '★' : '☆'}</button>`;
    return `<h1>Write a review</h1>${draft.rating ? '' : '<p class="subtitle">Choose a rating and add a short review.</p>'}` +
      ui.columns(
        `<form class="stack" data-form="rating-post">` +
          `<section class="card"><h2>${ui.esc(c.title)}</h2></section>` +
          (draft.error ? `<div class="notice error" role="alert">${ui.esc(draft.error)}</div>` : '') +
          `<fieldset class="rating"><legend>Your rating</legend><div class="stars">${[1, 2, 3, 4, 5].map(star).join('')}</div>` +
          `<p role="status">${draft.rating ? `${draft.rating} out of 5` : 'Select a rating'}</p></fieldset>` +
          `<label>Your review<textarea name="review" rows="5" maxlength="${MAX_REVIEW}">${ui.esc(draft.text)}</textarea></label>` +
          `<p class="hint">Keep feedback respectful and specific. Avoid personal information.</p>` +
          (draft.rating ? `<button class="button primary" type="submit">Post review</button>` : '') +
          ui.link('Cancel', `rating-detail/${c.id}`, 'secondary') +
        `</form>`,
        aside(ui)
      );
  }

  function posted(c, ui) {
    const own = mine().filter((r) => r.classId === c.id).pop();
    if (!own) return detail(c, ui);
    const { count, average } = stats(c.id);
    return `<h1>Review posted</h1>` + ui.columns(
      ui.notice('Thank you. Your review has been posted.') +
      ui.card(`${average.toFixed(1)} out of 5`, reviewCount(count)) +
      ui.card(`Your review · ${own.rating} out of 5`, own.text) +
      ui.link('Browse classes', 'classes', 'primary') + ui.link('Back to ratings', 'ratings', 'secondary'),
      aside(ui)
    );
  }

  (root.GradPathModules = root.GradPathModules || []).push({
    handles: (route) => /^(ratings|rating-detail|rating-write|rating-posted)(\/|$)/.test(route),
    section: () => 'ratings',
    render(route, ui) {
      if (route === 'ratings') return index(ui);
      const [name, id] = route.split('/');
      const c = C.find(id);
      if (!c) return `<h1>Class not found</h1>` + ui.card('We could not find that class', 'Go back to the ratings list to pick another one.') + ui.link('Back to ratings', 'ratings', 'primary');
      if (name === 'rating-write') return write(c, ui);
      if (name === 'rating-posted') return posted(c, ui);
      return detail(c, ui);
    },
    onSubmit(kind, data, ui) {
      if (kind === 'rating-search') {
        state.query = String(data.q || '').trim().slice(0, 80);
        ui.render();
        return true;
      }
      if (kind !== 'rating-post') return false;
      const text = String(data.review || '').trim().slice(0, MAX_REVIEW);
      draft.text = text;
      if (!draft.rating) draft.error = 'Choose a rating before posting.';
      else if (!text) draft.error = 'Add a short review before posting.';
      else {
        draft.error = '';
        saveMine([...mine().filter((r) => r.classId !== draft.classId), { classId: draft.classId, rating: draft.rating, text }]);
        const id = draft.classId;
        resetDraft('');
        ui.go(`rating-posted/${id}`);
        return true;
      }
      ui.render();
      return true;
    },
    onClick(action, element, ui) {
      if (action === 'rating-clear') state.query = '';
      else if (action === 'rating-star') {
        // keep whatever the person has typed before the page redraws
        const typed = typeof document !== 'undefined' && document.querySelector('textarea[name="review"]');
        if (typed && typeof typed.value === 'string') draft.text = typed.value;
        draft.rating = Math.min(5, Math.max(1, Number(element.dataset.value) || 1));
        draft.error = '';
      } else return false;
      ui.render();
      return true;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
