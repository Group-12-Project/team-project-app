// GradPath — Browse classes
// Covers Figma states: W15 browse, W16 search results (1 match), W17 no results.
(function () {
  // Placeholder catalog (matches the Figma frames). Swap for real data later.
  const classes = [
    {
      id: 'database-systems',
      title: 'Database Systems',
      credits: 3,
      meets: 'Mon/Wed 10:30 AM',
      blurb: 'Learn SQL and relational database design.',
      skills: ['sql', 'database', 'data modeling'],
      technical: true,
      inPlan: false
    },
    {
      id: 'software-engineering',
      title: 'Software Engineering',
      credits: 3,
      meets: 'Mon/Wed 9:00 AM',
      blurb: 'Already in your spring plan.',
      skills: ['testing', 'teamwork', 'design patterns'],
      technical: true,
      inPlan: true
    },
    {
      id: 'advanced-web-development',
      title: 'Advanced Web Development',
      credits: 3,
      meets: 'Tue/Thu 11:00 AM',
      blurb: 'Build and test a web application.',
      skills: ['javascript', 'html', 'css', 'web'],
      technical: true,
      inPlan: false
    }
  ];

  const state = { query: '', filter: 'all', searching: false };

  const $ = (id) => document.getElementById(id);
  const list = $('class-list');
  const form = $('search-form');
  const input = $('search');
  const title = $('page-title');
  const subtitle = $('page-subtitle');
  const back = $('back-btn');
  const count = $('result-count');
  const empty = $('empty-state');
  const clear = $('clear-btn');
  const filters = $('filters');

  function matches(c) {
    if (state.filter === 'technical' && !c.technical) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    return [c.title, c.blurb, ...c.skills].some((s) => s.toLowerCase().includes(q));
  }

  function card(c) {
    const a = document.createElement('a');
    a.className = 'content-card';
    a.href = c.inPlan ? 'schedule.html' : `class-detail.html?id=${encodeURIComponent(c.id)}`;

    const h = document.createElement('h2');
    h.className = 't-heading';
    h.textContent = c.title;

    const p = document.createElement('p');
    p.className = 't-small card-body';
    p.textContent = `${c.credits} credits · ${c.meets}\n${c.blurb}`;

    const act = document.createElement('span');
    act.className = 'card-action';
    act.textContent = c.inPlan ? 'View in schedule →' : 'View details →';

    a.append(h, p, act);
    return a;
  }

  function render() {
    const results = classes.filter(matches);
    list.replaceChildren(...results.map(card));

    const searching = state.query.trim() !== '';
    state.searching = searching;

    // Header swaps between browse and search-results modes
    back.hidden = !searching;
    subtitle.hidden = searching;
    title.textContent = searching ? 'Search results' : 'Browse classes';
    document.title = `${title.textContent} · GradPath`;

    // Result count + empty state + clear button
    count.hidden = !searching || results.length === 0;
    if (!count.hidden) {
      count.textContent = results.length === 1
        ? '1 class matches your search.'
        : `${results.length} classes match your search.`;
    }
    empty.hidden = results.length !== 0;
    clear.hidden = !searching;
  }

  function resetSearch() {
    state.query = '';
    input.value = '';
    render();
    input.focus();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    state.query = input.value;
    render();
  });

  // Typing back to empty returns to browse mode right away.
  input.addEventListener('input', () => {
    if (input.value.trim() === '' && state.query !== '') {
      state.query = '';
      render();
    }
  });

  back.addEventListener('click', resetSearch);
  clear.addEventListener('click', resetSearch);

  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    state.filter = btn.dataset.filter;
    filters.querySelectorAll('[data-filter]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b === btn)));
    render();
  });

  render();
})();
