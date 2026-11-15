import { useEffect, useState } from 'react'
import ProfilePage from './pages/ProfilePage.jsx'
import { loadProfile } from './services/profileService.js'

const navigationItems = [
  { label: 'Home', href: '#/' },
  { label: 'Classes', href: '#/classes' },
  { label: 'Schedule', href: '#/schedule' },
  { label: 'Career Readiness', href: '#/career' },
  { label: 'Course ratings', href: '#/ratings' },
  { label: 'My Profile', href: '#/profile' },
  { label: 'Preferences', href: '#/preferences' },
]

function getRoute() {
  return window.location.hash.replace(/^#\/?/, '') || 'home'
}

function App({ repository }) {
  const [route, setRoute] = useState(getRoute)
  const [profile, setProfile] = useState(() => repository ? null : loadProfile())
  const [loadState, setLoadState] = useState(repository ? 'loading' : 'ready')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!repository) return
    let active = true
    repository.load().then((savedProfile) => {
      if (active) {
        setProfile(savedProfile)
        setLoadState('ready')
      }
    }).catch((error) => {
      if (active) setLoadState(error.code === 'PROFILE_NOT_FOUND' ? 'missing' : 'error')
    })
    return () => { active = false }
  }, [repository, retry])

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (loadState !== 'ready') {
    return <main className="main-content">
      {loadState === 'loading' ? <p role="status">Loading your profile…</p> : <>
        <p role="alert">{loadState === 'missing' ? 'Your profile was not found. Contact the development team.' : 'We could not load your profile. Please try again.'}</p>
        <button className="button button--primary" onClick={() => {
          setLoadState('loading')
          setRetry((value) => value + 1)
        }}>Try again</button>
      </>}
    </main>
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/" aria-label="GradPath home">
          GradPath
        </a>
        <div className="current-user" aria-label="Fictional development profile">
          <span className="current-user__avatar" aria-hidden="true">
            {profile.preferredName
              .split(' ')
              .map((name) => name[0])
              .join('')
              .slice(0, 2)}
          </span>
          <span>{profile.preferredName}</span>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <nav aria-label="Primary navigation">
            <ul className="nav-list">
              {navigationItems.map((item) => {
                const itemRoute = item.href.replace(/^#\/?/, '') || 'home'
                const isActive =
                  route === itemRoute || (itemRoute === 'profile' && route.startsWith('profile/'))
                return (
                  <li key={item.href}>
                    <a
                      className={isActive ? 'nav-link nav-link--active' : 'nav-link'}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <main id="main-content" className="main-content">
          {route === 'home' ? (
            <section className="welcome-card" aria-labelledby="welcome-heading">
              <p className="eyebrow">Spring 2027 planning</p>
              <h1 id="welcome-heading">Welcome to GradPath</h1>
              <p>
                Review your academic information and keep your interests and goals current before
                planning your next semester.
              </p>
              <a className="button button--primary" href="#/profile">
                View my profile
              </a>
            </section>
          ) : route === 'profile' || route === 'profile/edit' ? (
            <ProfilePage
              mode={route === 'profile/edit' ? 'edit' : 'view'}
              profile={profile}
              onProfileChange={setProfile}
              repository={repository}
            />
          ) : (
            <section aria-labelledby="backlog-heading">
              <p className="eyebrow">Product backlog</p>
              <h1 id="backlog-heading">Coming in a future sprint</h1>
              <p>This area is intentionally outside the selected Sprint 1 story.</p>
              <a className="button button--secondary" href="#/profile">
                Go to My Profile
              </a>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App

