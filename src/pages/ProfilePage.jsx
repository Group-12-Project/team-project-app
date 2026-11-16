import { useState } from 'react'
import ProfileEditForm from '../components/ProfileEditForm.jsx'
import ProfileView from '../components/ProfileView.jsx'
import { saveProfile } from '../services/profileService.js'

function ProfilePage({ mode = 'view', onProfileChange, profile, repository }) {
  const [successMessage, setSuccessMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [storedProfile, setStoredProfile] = useState(null)

  function openProfile() {
    window.location.hash = '#/profile'
  }

  async function handleSave(updatedProfile) {
    if (saving) return
    setSaveError('')
    setServerErrors({})
    setStoredProfile(null)
    setSaving(true)

    try {
      const savedProfile = repository
        ? await repository.save(updatedProfile)
        : saveProfile(updatedProfile)
      onProfileChange(savedProfile)
      setSuccessMessage('Your profile changes were saved successfully.')
      openProfile()
    } catch (error) {
      setServerErrors(error.fields || {})
      setSaveError(
        repository
          ? 'We could not confirm your save. Your draft is still available. Check stored values before retrying.'
          : 'We could not save your profile in this browser. Your draft is still available; try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  if (mode === 'edit') {
    return (
      <>
        {saveError ? (
          <div className="error-banner" role="alert">
            {saveError}
            {repository ? <button className="button button--secondary" type="button" onClick={async () => {
              try { setStoredProfile(await repository.load()) }
              catch { setSaveError('Stored values could not be loaded. Your draft is still available; try again.') }
            }}>Check stored values</button> : null}
          </div>
        ) : null}
        {storedProfile ? <section className="card" aria-label="Stored profile" role="status">
          <h2>Current stored values</h2><p>{storedProfile.preferredName}</p>
          <p>{storedProfile.academicInterests.join(', ') || 'No interests'}</p><p>{storedProfile.careerGoal}</p>
        </section> : null}
        <ProfileEditForm serverErrors={serverErrors} profile={profile} onCancel={openProfile} onSave={handleSave} saving={saving} />
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

