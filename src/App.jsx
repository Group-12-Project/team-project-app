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

function App() {
  const [route, setRoute] = useState(getRoute)
  const [profile, setProfile] = useState(loadProfile)

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#/" aria-label="GradPath home">
          GradPath
        </a>
        <div className="current-user" aria-label="Signed in user">
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
                return (
                  <li key={item.href}>
                    <a
                      className={route === itemRoute ? 'nav-link nav-link--active' : 'nav-link'}
                      href={item.href}
                      aria-current={route === itemRoute ? 'page' : undefined}
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

