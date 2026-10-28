import { useState } from 'react'
import ProfileView from '../components/ProfileView.jsx'
import { loadProfile } from '../services/profileService.js'

function ProfilePage({ mode = 'view' }) {
  const [profile] = useState(loadProfile)

  if (mode === 'edit') {
    return (
      <section className="card" aria-labelledby="edit-profile-heading">
        <p className="eyebrow">Student profile</p>
        <h1 id="edit-profile-heading">Edit profile</h1>
        <p>The editable profile form is the next implementation milestone.</p>
        <a className="button button--secondary" href="#/profile">
          Cancel
        </a>
      </section>
    )
  }

  return <ProfileView profile={profile} onEdit={() => (window.location.hash = '#/profile/edit')} />
}

export default ProfilePage

