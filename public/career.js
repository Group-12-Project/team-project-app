'use strict';
// Career Readiness area: hub (W29), clubs / skills / internships (W30-W32) and their details (W33-W35),
// opportunity saved (W36), My next steps (W37, W38), step completed (W45),
// and interview practice (W39-W43). Opportunities are sample data for this prototype.
(function (root) {
  const C = root.GradPathCatalog;
  const KEY = 'gradpath.nextsteps';

  const KINDS = {
    club: { label: 'Clubs & organizations', list: 'career-clubs', detail: 'club-detail' },
    skill: { label: 'Skills & classes', list: 'career-skills', detail: 'skill-detail' },
    internship: { label: 'Internships', list: 'career-internships', detail: 'internship-detail' }
  };
  const OPPORTUNITIES = [
    { id: 'computing-club', kind: 'club', title: 'Computing club',
      summary: 'Work with other students on a small project and practice explaining your ideas.',
      why: 'Build teamwork, coding, and communication skills. Create an example you can discuss in an interview.',
      next: 'Find a campus computing club and attend an introductory meeting. Ask how to join a beginner project.' },
    { id: 'database-systems', kind: 'skill', title: 'Database Systems', classId: 'database-systems',
      summary: 'Learn SQL, data modeling, and how to build a relational database.',
      why: 'Add a practical technical skill and a database project to your portfolio.',
      next: 'Review the class prerequisites and meeting times. Add it to your plan if it fits your schedule.' },
    { id: 'software-development-internship', kind: 'internship', title: 'Software development internship',
      summary: 'Practice software development in a supervised workplace. Example opportunity for this prototype.',
      why: 'Gain work experience, learn team workflows, and collect examples of problems you have solved.',
      next: 'Prepare a one-page resume, select one relevant project, and check the employer’s application requirements.' }
  ];
  const findOpp = (kind, id) => OPPORTUNITIES.find((o) => o.kind === kind && o.id === id);
  const byId = (id) => OPPORTUNITIES.find((o) => o.id === id);

  const EXTRA = {
    club: ['Other ways to get involved', 'Look for a professional student organization, a campus volunteer team, or an event-planning role.'],
    skill: ['Turn a skill into evidence', 'Save a small project, explain the problem it solves, and describe what you contributed.'],
    internship: ['Prepare before applying', 'Update your resume, choose a relevant project, and tailor your application to the role.']
  };

  const QUESTIONS = [
    { type: 'Behavioral', question: 'Tell me about a time you worked on a team.',
      hint: 'Think of a class project, a club activity, a job, or a volunteer experience.',
      tipTitle: 'Plan your answer with STAR',
      tip: 'Situation: What was happening? Task: What were you responsible for? Action: What did you do? Result: What changed or what did you learn?' },
    { type: 'Technical', question: 'Walk me through a project you built.',
      hint: 'Explain the problem, the tools you used, a challenge you faced, and what you would improve.',
      tipTitle: 'Make your skills concrete',
      tip: 'Describe your decisions and tradeoffs. Be honest about what you built yourself and what your teammates contributed.' }
  ];

  // ---- saved next steps (localStorage, with an in-memory fallback) ----
  let memory = null;
  function steps() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY));
      if (Array.isArray(stored)) return stored.filter((s) => s && byId(s.id)).map((s) => ({ id: s.id, done: s.done === true }));
    } catch { /* blocked or malformed */ }
    return memory ? memory.slice() : [];
  }
  function saveSteps(list) {
    memory = list.slice();
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* keep the in-memory copy */ }
  }

  // Interview practice progress lasts for the session.
  const practice = { done: [false, false], last: 1 };

  const hubAside = (ui) =>
    ui.card('Small steps, real experience', 'Choose a class, join an organization, or apply for an internship. Save one next step you can act on this week.') +
    ui.card('Prepare for interviews', 'Practice specific answers and prepare questions.', 'interview/1', 'Practice interviews →');

  function hub(ui) {
    const goal = (ui.profile().goal || '').trim();
    return `<h1>Career Readiness</h1><p class="subtitle">Small actions that move you toward your career goal.</p>` + ui.columns(
      `<p class="subtitle">Build skills and experience you can explain to an employer.</p>` +
      `<div class="tiles">${ui.card('Clubs & organizations', 'Find people, projects, and leadership opportunities.', 'career-clubs', 'Explore involvement →')}${ui.card('Skills & classes', 'Build practical skills through classes and projects.', 'career-skills', 'Find a skill to build →')}</div>` +
      `<div class="tiles">${ui.card('Internships', 'Prepare for hands-on experience in your field.', 'career-internships', 'Explore internships →')}${ui.card('Interview practice', 'Practice specific answers and prepare questions.', 'interview/1', 'Practice interviews →')}</div>` +
      ui.link('My next steps', 'career-plan', 'secondary'),
      ui.card('Your goal', goal ? `${goal}\nBased on your profile` : 'No career goal added yet.') +
      ui.link('Update career goal', 'profile-edit', 'secondary') +
      ui.card('Choose one action this week', 'Attend a club meeting, research a technical class, or prepare one interview example.')
    );
  }

  function list(kind, ui) {
    const k = KINDS[kind];
    return `<h1>${ui.esc(k.label)}</h1>` + ui.columns(
      OPPORTUNITIES.filter((o) => o.kind === kind).map((o) => ui.card(o.title, o.summary, `${k.detail}/${o.id}`, 'View details →')).join('') +
      ui.card(EXTRA[kind][0], EXTRA[kind][1]) + ui.link('My next steps', 'career-plan', 'secondary'),
      hubAside(ui)
    );
  }

  function detail(o, ui) {
    const saved = steps().some((s) => s.id === o.id);
    return `<h1>${ui.esc(o.title)}</h1><p class="subtitle">${ui.esc(KINDS[o.kind].label)}</p>` + ui.columns(
      ui.card('About this opportunity', o.summary) + ui.card('Why it helps', o.why) + ui.card('Your next action', o.next) +
      (saved
        ? `<button class="button primary" type="button" disabled>Saved to my next steps</button>`
        : `<button class="button primary" type="button" data-action="career-save" data-id="${ui.esc(o.id)}">Save to my next steps</button>`) +
      (o.classId && C.find(o.classId) ? ui.link('Review class details', `class-detail/${o.classId}`, 'secondary') : ''),
      hubAside(ui)
    );
  }

  function plan(ui) {
    const saved = steps();
    const main = saved.length
      ? saved.map((s) => {
          const o = byId(s.id);
          return `<section class="card"><h2>${ui.esc(o.title)}</h2><p>${s.done ? 'Completed' : 'To do'} · ${ui.esc(KINDS[o.kind].label)}</p>` +
            `<div class="stack">${s.done
              ? `<button class="button secondary" type="button" data-action="career-todo" data-id="${ui.esc(o.id)}">Mark as to do</button>`
              : `<button class="button primary" type="button" data-action="career-complete" data-id="${ui.esc(o.id)}">Mark completed</button>`}` +
            `<button class="button secondary" type="button" data-action="career-remove" data-id="${ui.esc(o.id)}">Remove from my next steps</button></div></section>`;
        }).join('') + ui.link('Explore more opportunities', 'career', 'secondary')
      : ui.card('No saved opportunities yet', 'Explore a club, a skill-building class, or an internship. Save one to start your plan.') + ui.link('Explore career opportunities', 'career', 'primary');
    return `<h1>My next steps</h1>` + ui.columns(
      main,
      ui.card('Make it specific', 'Choose an action you can complete this week. Mark it completed when you have taken that step.') +
      ui.card('Interview practice', 'Practice specific answers and prepare questions.', 'interview/1', 'Practice interviews →')
    );
  }

  function interview(n, ui) {
    const i = n === 2 ? 1 : 0;
    const q = QUESTIONS[i];
    practice.last = i + 1;
    return `<h1>Interview practice</h1><p class="subtitle">Question ${i + 1} of ${QUESTIONS.length} · ${q.type}</p>` + ui.columns(
      ui.card(q.question, q.hint) + ui.card(q.tipTitle, q.tip) +
      `<button class="button primary" type="button" data-action="interview-practiced" data-n="${i + 1}">Mark as practiced</button>` +
      (i === 1 ? ui.link('Previous question', 'interview/1', 'secondary') : '') +
      ui.link('Interview preparation tips', 'interview-tips', 'secondary'),
      ui.card('Practice out loud', 'Keep the example specific and describe your own contribution. Aim for a clear answer that takes about 1–2 minutes.')
    );
  }

  const interviewTips = (ui) => `<h1>Interview preparation</h1>` + ui.columns(
    ui.card('Before the interview', 'Read the job description. Research the employer. Choose two relevant examples. Prepare questions about the role. Check the time, location, or video link.') +
    ui.card('During the interview', 'Listen to the full question. Use specific examples. Explain your thinking. Ask for clarification when needed.') +
    ui.card('Questions you can ask', 'What would success look like in this role? How does the team support learning?') +
    ui.link('Back to practice', `interview/${practice.last}`, 'primary'), '');

  const confirmation = (title, text, extra, ui) => `<h1>${title}</h1>` + ui.columns(ui.notice(text) + `<p class="subtitle">${ui.esc(extra)}</p>` + ui.link('View my next steps', 'career-plan', 'primary') + ui.link('Explore more opportunities', 'career', 'secondary'), '');

  const NAMES = /^(career|career-clubs|career-skills|career-internships|club-detail|skill-detail|internship-detail|opportunity-saved|career-plan|step-completed|interview|interview-tips|interview-practiced|interview-finish)(\/|$)/;

  (root.GradPathModules = root.GradPathModules || []).push({
    handles: (route) => NAMES.test(route),
    section: () => 'career',
    render(route, ui) {
      const [name, id] = route.split('/');
      switch (name) {
        case 'career': return hub(ui);
        case 'career-clubs': return list('club', ui);
        case 'career-skills': return list('skill', ui);
        case 'career-internships': return list('internship', ui);
        case 'club-detail': case 'skill-detail': case 'internship-detail': {
          const kind = name === 'club-detail' ? 'club' : name === 'skill-detail' ? 'skill' : 'internship';
          const o = findOpp(kind, id);
          return o ? detail(o, ui) : `<h1>Opportunity not found</h1>` + ui.card('We could not find that opportunity', 'Go back to Career Readiness to pick another one.') + ui.link('Back to Career Readiness', 'career', 'primary');
        }
        case 'opportunity-saved': return confirmation('Opportunity saved', 'Added to My next steps.', 'Your saved opportunity is ready when you want to take action.', ui);
        case 'step-completed': return confirmation('Step completed', 'Step marked completed.', 'You completed a career-readiness step. Keep building experience one action at a time.', ui);
        case 'career-plan': return plan(ui);
        case 'interview': return interview(Number(id), ui);
        case 'interview-tips': return interviewTips(ui);
        case 'interview-practiced': return `<h1>Answer practiced</h1>` + ui.columns(ui.notice('First question completed.') + ui.card('Reflect on your answer', 'Did you explain your contribution and a clear result? Revise the example if needed.') + ui.link('Next question', 'interview/2', 'primary') + ui.link('Practice this question again', 'interview/1', 'secondary'), '');
        default: {
          const count = practice.done.filter(Boolean).length;
          return `<h1>Practice complete</h1>` + ui.columns(ui.notice(`You practiced ${count} interview question${count === 1 ? '' : 's'}.`) + ui.card('Keep improving', 'Use a new example next time. Practice with a friend and ask whether your explanation is clear.') + ui.link('Back to Career Readiness', 'career', 'primary') + `<button class="button secondary" type="button" data-action="interview-reset">Practice again</button>`, '');
        }
      }
    },
    onClick(action, element, ui) {
      const id = element && element.dataset && element.dataset.id;
      const update = (fn) => saveSteps(fn(steps()));
      switch (action) {
        case 'career-save':
          if (!byId(id)) return true;
          update((list) => (list.some((s) => s.id === id) ? list : [...list, { id, done: false }]));
          ui.go('opportunity-saved');
          return true;
        case 'career-complete':
          update((list) => list.map((s) => (s.id === id ? { ...s, done: true } : s)));
          ui.go('step-completed');
          return true;
        case 'career-todo':
          update((list) => list.map((s) => (s.id === id ? { ...s, done: false } : s)));
          ui.render();
          return true;
        case 'career-remove':
          update((list) => list.filter((s) => s.id !== id));
          ui.render();
          return true;
        case 'interview-practiced': {
          const n = Number(element.dataset.n) === 2 ? 2 : 1;
          practice.done[n - 1] = true;
          ui.go(n === 1 ? 'interview-practiced' : 'interview-finish');
          return true;
        }
        case 'interview-reset':
          practice.done = [false, false];
          ui.go('interview/1');
          return true;
        default: return false;
      }
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
