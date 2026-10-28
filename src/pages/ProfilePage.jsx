import { useState } from 'react'
import ProfileEditForm from '../components/ProfileEditForm.jsx'
import ProfileView from '../components/ProfileView.jsx'
import { saveProfile } from '../services/profileService.js'

function ProfilePage({ mode = 'view', onProfileChange, profile }) {
  const [successMessage, setSuccessMessage] = useState('')
  const [saveError, setSaveError] = useState('')

  function openProfile() {
    window.location.hash = '#/profile'
  }

  function handleSave(updatedProfile) {
    setSaveError('')

    try {
      const savedProfile = saveProfile(updatedProfile)
      onProfileChange(savedProfile)
      setSuccessMessage('Your profile changes were saved successfully.')
      openProfile()
    } catch {
      setSaveError(
        'We could not save your profile in this browser. Your draft is still available; try again.',
      )
    }
  }

  if (mode === 'edit') {
    return (
      <>
        {saveError ? (
          <div className="error-banner" role="alert">
            {saveError}
          </div>
        ) : null}
        <ProfileEditForm profile={profile} onCancel={openProfile} onSave={handleSave} />
      </>
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
          setSaveError('')
          window.location.hash = '#/profile/edit'
        }}
      />
    </>
  )
}

export default ProfilePage

