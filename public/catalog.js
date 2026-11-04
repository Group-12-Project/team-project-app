'use strict';
// GradPath class catalog + planned-class store.
// Sample data from the Figma prototype. These are not verified academic records.
(function (root) {
  const CLASSES = [
    { id: 'database-systems', title: 'Database Systems', credits: 3, days: ['Mon', 'Wed'], start: '10:30', end: '11:45', section: '01', mode: 'In person', listed: true, technical: true,
      blurb: 'Learn SQL and relational database design.',
      learn: 'Design relational databases, write SQL queries, and build a small database project.',
      prerequisite: 'Introduction to Programming', skills: ['sql', 'database', 'data modeling'] },
    { id: 'software-engineering', title: 'Software Engineering', credits: 3, days: ['Mon', 'Wed'], start: '09:00', end: '10:15', section: '01', mode: 'In person', listed: true, technical: true,
      blurb: 'Build and test software as part of a team.',
      learn: 'Plan, build, and test software as part of a small team.',
      prerequisite: '', skills: ['testing', 'teamwork', 'design patterns'] },
    { id: 'advanced-web-development', title: 'Advanced Web Development', credits: 3, days: ['Tue', 'Thu'], start: '11:00', end: '12:15', section: '01', mode: 'In person', listed: true, technical: true,
      blurb: 'Build and test a web application.',
      learn: 'Build and test a complete web application.',
      prerequisite: '', skills: ['javascript', 'html', 'css', 'web'] },
    // In the starting plan, but not shown in the Browse list.
    { id: 'computing-ethics', title: 'Computing Ethics', credits: 3, days: ['Tue', 'Thu'], start: '11:00', end: '12:15', section: '01', mode: 'In person', listed: false, technical: false,
      blurb: 'Explore ethical questions in computing.',
      learn: 'Explore ethical questions in computing.',
      prerequisite: '', skills: ['ethics'] }
  ];

  const LONG_DAYS = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday' };
  const find = (id) => CLASSES.find((c) => c.id === id);
  const minutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

  function formatTime(t, meridiem = true) {
    const [h, m] = t.split(':').map(Number);
    const base = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
    return meridiem ? `${base} ${h >= 12 ? 'PM' : 'AM'}` : base;
  }
  function formatRange(c) {
    const sameHalf = (minutes(c.start) >= 720) === (minutes(c.end) >= 720);
    return sameHalf ? `${formatTime(c.start, false)}–${formatTime(c.end)}` : `${formatTime(c.start)}–${formatTime(c.end)}`;
  }
  const shortDays = (c) => c.days.join('/');
  const longDays = (c) => c.days.map((d) => LONG_DAYS[d]).join(' & ');

  // ---- planned classes (localStorage, with an in-memory fallback if storage is blocked) ----
  const KEY = 'gradpath.plan';
  const DEFAULT_PLAN = ['software-engineering', 'computing-ethics'];
  let memory = null;

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(stored)) return stored.filter((id) => typeof id === 'string' && find(id));
    } catch { /* blocked or malformed: fall through */ }
    return memory ? memory.slice() : DEFAULT_PLAN.slice();
  }
  function save(ids) {
    memory = ids.slice();
    try { localStorage.setItem(KEY, JSON.stringify(ids)); return true; } catch { return false; }
  }

  const Plan = {
    ids: load,
    classes: () => load().map(find),
    has: (id) => load().includes(id),
    add(id) { if (!find(id)) return false; const ids = load(); if (!ids.includes(id)) ids.push(id); save(ids); return true; },
    remove(id) { save(load().filter((x) => x !== id)); },
    credits: () => load().reduce((sum, id) => sum + find(id).credits, 0),
    // The first planned class that overlaps this one, or null.
    conflictWith(c) {
      for (const other of load().map(find)) {
        if (other.id === c.id) continue;
        const days = c.days.filter((d) => other.days.includes(d));
        if (days.length && minutes(c.start) < minutes(other.end) && minutes(other.start) < minutes(c.end)) return { with: other, days };
      }
      return null;
    }
  };

  root.GradPathCatalog = { classes: CLASSES, find, formatTime, formatRange, shortDays, longDays, longDayNames: LONG_DAYS };
  root.GradPathPlan = Plan;
})(typeof window !== 'undefined' ? window : globalThis);
