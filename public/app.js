'use strict';
const app = document.querySelector('#app');
const initialProfile = {name:'James Peterson',major:'Computer Science',concentration:'Software Engineering',graduation:'May 2027',year:'Senior',gpa:'3.4',goal:'Software engineer'};
function read(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
let profile = {...initialProfile,...read('gradpath.profile',{})};
let preferences = {...{schedule:'Morning',work:'Part-time'},...read('gradpath.preferences',{})};
let signedIn = sessionStorage.getItem('gradpath.session') === 'demo';
let menuOpen = false;
let message = '';
const navigation = [['home','Home'],['classes','Classes'],['schedule','Schedule'],['career','Career Readiness'],['ratings','Course ratings'],['profile','My Profile'],['preferences','Preferences']];
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const link = (text, route, style='') => `<a class="button ${style}" href="#${route}">${esc(text)}</a>`;
const button = (text, action, style='') => `<button class="button ${style}" type="button" data-action="${action}">${esc(text)}</button>`;
const field = (label, name, value='', type='text', placeholder='', extra='') => `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${extra}></label>`;
const card = (title, body, route='', action='', soft=false) => `<${route?'a':'section'} ${route?`href="#${route}"`:''} class="card ${route?'link':''} ${soft?'soft':''}"><h2>${esc(title)}</h2><p>${esc(body)}</p>${action?`<span class="action">${esc(action)}</span>`:''}</${route?'a':'section'}>`;
const progress = () => `<section class="card soft progress"><h2>Degree progress</h2><p>93 of 120 credits completed</p><progress value="93" max="120" aria-label="Degree progress: 93 of 120 credits"></progress><small>27 credits remaining</small></section>`;
const notice = text => `<div class="notice" role="status">${esc(text)}</div>`;
const columns = (main, aside) => `<div class="columns"><div class="stack">${main}</div><aside class="stack">${aside}</aside></div>`;
const ui = {esc,link,button,field,card,notice,columns,profile:()=>profile,go:route=>go(route),render:()=>render()};
const extensions = () => window.GradPathModules || [];
function go(route) { if(location.hash===`#${route}`) render(); else location.hash=route; }
function auth(route) {
  let content;
  if(route==='signup') content=`<h1>Create your account</h1><p class="subtitle">Keep your academic and career plans together.</p>${field('Full name','name','','text','James Peterson','required autocomplete="name"')}${field('University email','email','','email','james.peterson@example.edu','required autocomplete="email"')}${field('Password','password','','password','','required minlength="8" autocomplete="new-password"')}<p>Use at least 8 characters.</p>${field('Confirm password','confirm','','password','','required minlength="8" autocomplete="new-password"')}<button class="button primary">Create account</button>${link('Already have an account? Log in','login')}`;
  else if(route==='reset') content=`<h1>Reset your password</h1><p class="subtitle">Enter your email and we will send reset instructions.</p>${field('University email','email','','email','james.peterson@example.edu','required autocomplete="email"')}<button class="button primary">Send reset instructions</button>${link('Back to log in','login')}<p class="demo">Demo only: this app cannot send reset emails.</p>`;
  else if(route==='reset-sent') content=`<h1>Check your email</h1>${notice('Demo reset request recorded. No email was sent.')}<p class="subtitle">Return to log in to continue exploring GradPath.</p>${link('Back to log in','login','primary')}${link('Use a different email','reset')}`;
  else content=`<h1>Welcome back</h1><p class="subtitle">Log in to GradPath</p><p class="subtitle">Plan your classes. Prepare for what comes next.</p>${field('University email','email','','email','Enter your email','required autocomplete="email"')}${field('Password','password','','password','Enter your password','required autocomplete="current-password"')}<button class="button primary">Log in</button>${link('Forgot password?','reset')}${link('Create an account','signup','secondary')}<p class="demo">Local demo: enter any email and password to explore. No credentials are sent or stored.</p>`;
  return `<div class="auth"><section class="welcome"><h1>Make a plan.<br>Build your future.</h1><p class="subtitle">Keep your classes, schedule, and career next steps in one place.</p>${card('Built around student life','A simple way to plan your semester, learn from other students, and prepare for your next opportunity.','','',true)}</section><form class="account" data-form="${route}">${content}<div id="form-error" class="notice error" role="alert" hidden></div></form></div>`;
}
function home() {
  return `<h1>Hi, ${esc(profile.name.split(' ')[0])}</h1><p class="subtitle">A clear plan for your classes and your career.</p>${columns(`${card('Your next semester starts here','Plan a schedule that fits your goals, then choose a career step to work on.')}<div class="tiles">${card('Classes','Browse classes and review prerequisites.','classes','Explore classes →')}${card('My schedule','Review your planned classes for Spring 2027.','schedule','View schedule →')}</div><div class="tiles">${card('Career Readiness','Build experience, learn skills, and practice interviews.','career','Choose a next step →')}${card('Course ratings','See what other students thought about their classes.','ratings','Read ratings →')}</div>`,`${progress()}${card('My Profile',`${profile.major} · ${profile.year}\nGraduating ${profile.graduation}`,'profile','View profile →')}${card('My next steps','See the career opportunities you have saved.','career-plan','Open my next steps →')}`)}`;
}
function profileView() {
  return `<h1>My Profile</h1>${columns(`${message?notice(message):''}${card(profile.name,`${profile.major} · ${profile.year}\n${profile.concentration} concentration`)}${progress()}${card('Academic information',`Expected graduation: ${profile.graduation}\nCurrent GPA: ${profile.gpa}\nCredits remaining: 27`)}${card('Career goal',profile.goal)}${link('Edit profile','profile-edit','primary')}`,`${card('Schedule preferences',`${preferences.schedule} classes\nWork status: ${preferences.work}`)}${link('Edit preferences','preferences','secondary')}${card('Career Readiness','Turn your career goal into practical next steps.','career','Explore career steps →')}`)}`;
}
function editProfile() {
  const fields=[['Full name','name'],['Major','major'],['Concentration','concentration'],['Expected graduation','graduation'],['Current year','year'],['Current GPA','gpa'],['Career goal','goal']];
  return `<h1>Edit profile</h1><p class="subtitle">Keep your academic information up to date.</p>${columns(`<form class="stack" data-form="profile">${fields.map(([label,key])=>field(label,key,profile[key],key==='gpa'?'number':'text','',key==='gpa'?'required min="0" max="4" step="0.01"':'required maxlength="120"')).join('')}<button class="button primary">Save changes</button>${link('Cancel','profile')}</form>`,`${card('Your information','Profile details are entered by you. Review your degree progress with your advisor.')}${link('Edit schedule preferences','preferences','secondary')}`)}`;
}
function preferencesView() {
  return `<h1>Preferences</h1>${columns(`<form class="stack" data-form="preferences">${message?notice(message):''}<label>Preferred schedule<select name="schedule">${['Morning','Afternoon','Evening','No preference'].map(v=>`<option ${v===preferences.schedule?'selected':''}>${v}</option>`).join('')}</select></label><label>Work status<select name="work">${['Part-time','Full-time','Not working'].map(v=>`<option ${v===preferences.work?'selected':''}>${v}</option>`).join('')}</select></label><p>These preferences help you plan. They do not change your enrolled classes.</p><button class="button primary">Save preferences</button>${link('Cancel','home')}</form>`,card('Keep your plan realistic','Consider your work hours and how much time you need for studying and travel.'))}`;
}
function unavailable(route) {
  const title=Object.fromEntries([...navigation,['career-plan','My next steps']])[route]||'Page unavailable';
  return `<h1>${esc(title)}</h1><section class="card unavailable"><h2>This section is not available yet</h2><p>Explore the available GradPath screens below.</p>${link('Database Systems','class-detail','secondary')}${link('My Profile','profile','secondary')}${link('Back to home','home','primary')}</section>`;
}
function render() {
  let route=location.hash.slice(1)||'login';
  const authRoutes=['login','signup','reset','reset-sent'];
  if(!signedIn&&!authRoutes.includes(route)) { go('login'); return; }
  if(signedIn&&authRoutes.includes(route)) { go('home'); return; }
  document.title=`${route==='home'?'Home':route==='login'?'Welcome back':'GradPath'} · GradPath`;
  const header=`<header><a class="brand" href="#${signedIn?'home':'login'}">GradPath</a>${signedIn?`<div class="header-actions">${button('Menu','menu','mobile-toggle')}${link(profile.name,'profile')}</div>`:''}</header>`;
  if(!signedIn) { app.innerHTML=header+auth(route); return; }
  const active=extensions().find(module=>module.handles(route))?.section?.(route)||(route.startsWith('profile')?'profile':route);
  const ext=extensions().find(module=>module.handles(route));
  const body=route==='home'?home():route==='profile'?profileView():route==='profile-edit'?editProfile():route==='preferences'?preferencesView():ext?ext.render(route,ui):unavailable(route);
  app.innerHTML=header+`<div class="workspace"><nav aria-label="Main navigation" class="${menuOpen?'open':''}">${navigation.map(([id,label])=>`<a class="button ${active===id?'active':''}" ${active===id?'aria-current="page"':''} href="#${id}">${label}</a>`).join('')}<p class="term">SPRING 2027</p><p>Plan your next semester.</p>${button('Log out','logout')}</nav><main id="main">${route==='home'||ext?.ownsBack?.(route)?'':link('← Back','home','back')}${body}</main></div><dialog id="logout-dialog"><div class="stack"><h1>Log out?</h1><p>Your saved profile and preferences will stay on this device.</p>${button('Log out','confirm-logout','primary')}${button('Cancel','cancel-logout','secondary')}</div></dialog>`;
}
app.addEventListener('submit',event=>{
  const form=event.target.closest('form'); if(!form)return; event.preventDefault();
  const data=Object.fromEntries(new FormData(form));
  const kind=form.dataset.form;
  if(extensions().some(module=>module.onSubmit?.(kind,data,ui)))return;
  if(kind==='signup'&&data.password!==data.confirm){const error=document.querySelector('#form-error');error.textContent='Passwords must match.';error.hidden=false;return;}
  if(kind==='login'||kind==='signup') {
    if(kind==='signup') { profile={...profile,name:data.name};localStorage.setItem('gradpath.profile',JSON.stringify(profile)); }
    signedIn=true;sessionStorage.setItem('gradpath.session','demo');go('home');
  } else if(kind==='reset')go('reset-sent');
  else if(kind==='profile') {profile={...profile,...data};localStorage.setItem('gradpath.profile',JSON.stringify(profile));message='Profile updated successfully.';go('profile');}
  else if(kind==='preferences'){preferences=data;localStorage.setItem('gradpath.preferences',JSON.stringify(preferences));message='Preferences saved.';render();}
});
app.addEventListener('click',event=>{
  const element=event.target.closest('[data-action]');const action=element?.dataset.action;
  if(extensions().some(module=>module.onClick?.(action,element,ui)))return;
  if(action==='menu'){menuOpen=!menuOpen;render();}
  if(action==='logout')document.querySelector('#logout-dialog').showModal();
  if(action==='cancel-logout')document.querySelector('#logout-dialog').close();
  if(action==='confirm-logout'){signedIn=false;sessionStorage.removeItem('gradpath.session');go('login');}
});
window.addEventListener('hashchange',()=>{message=location.hash==='#profile'?message:'';menuOpen=false;render();window.scrollTo(0,0);});
render();
