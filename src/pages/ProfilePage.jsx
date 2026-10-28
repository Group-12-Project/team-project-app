import { useState } from 'react'
import ProfileEditForm from '../components/ProfileEditForm.jsx'
import ProfileView from '../components/ProfileView.jsx'
import { saveProfile } from '../services/profileService.js'

function ProfilePage({ mode = 'view', onProfileChange, profile }) {
  const [successMessage, setSuccessMessage] = useState('')

  function openProfile() {
    window.location.hash = '#/profile'
  }

  function handleSave(updatedProfile) {
    const savedProfile = saveProfile(updatedProfile)
    onProfileChange(savedProfile)
    setSuccessMessage('Your profile changes were saved successfully.')
    openProfile()
  }

  if (mode === 'edit') {
    return (
      <ProfileEditForm profile={profile} onCancel={openProfile} onSave={handleSave} />
    )
  }

  return (
    <>
      {successMessage ? (
        <div className="success-banner" role="status">
          <span aria-hidden="true">✓</span>
          {successMessage}
        </div>
      ) : null}
      <ProfileView
        profile={profile}
        onEdit={() => {
          setSuccessMessage('')
          window.location.hash = '#/profile/edit'
        }}
      />
    </>
  )
}

export default ProfilePage

