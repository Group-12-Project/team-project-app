import { useRef, useState } from 'react'
import { PROFILE_LIMITS, validateProfileDraft } from '../utils/profileValidation.js'

function ProfileEditForm({ profile, onCancel, onSave }) {
  const [draft, setDraft] = useState({
    preferredName: profile.preferredName,
    interestsText: profile.academicInterests.join(', '),
    careerGoal: profile.careerGoal,
  })
  const [errors, setErrors] = useState({})
  const preferredNameRef = useRef(null)
  const interestsRef = useRef(null)
  const careerGoalRef = useRef(null)

  const fieldRefs = {
    preferredName: preferredNameRef,
    interestsText: interestsRef,
    careerGoal: careerGoalRef,
  }

  function updateDraft(event) {
    const { name, value } = event.target
    setDraft((currentDraft) => ({ ...currentDraft, [name]: value }))

    if (errors[name]) {
      setErrors((currentErrors) => ({ ...currentErrors, [name]: undefined }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = validateProfileDraft(draft)

    if (Object.keys(result.errors).length) {
      setErrors(result.errors)
      const firstInvalidField = ['preferredName', 'interestsText', 'careerGoal'].find(
        (fieldName) => result.errors[fieldName],
      )
      fieldRefs[firstInvalidField]?.current?.focus()
      return
    }

    onSave({
      ...profile,
      preferredName: result.normalized.preferredName,
      academicInterests: result.normalized.academicInterests,
      careerGoal: result.normalized.careerGoal,
    })
  }

  return (
    <div className="edit-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Student profile</p>
          <h1>Edit profile</h1>
          <p className="page-intro">
            Update the information GradPath uses to personalize planning support. Official academic
            information remains read only.
          </p>
        </div>
      </header>

      <form className="edit-form" onSubmit={handleSubmit} noValidate>
        <section className="card form-section" aria-labelledby="editable-information-heading">
          <div className="card-heading-row">
            <h2 id="editable-information-heading">Editable information</h2>
            <span className="editable-badge">You can update these fields</span>
          </div>

          <div className="field">
            <label htmlFor="preferred-name">
              Preferred name <span className="required-label">Required</span>
            </label>
            <input
              ref={preferredNameRef}
              id="preferred-name"
              name="preferredName"
              type="text"
              value={draft.preferredName}
              maxLength={PROFILE_LIMITS.preferredName}
              aria-invalid={Boolean(errors.preferredName)}
              aria-describedby={errors.preferredName ? 'preferred-name-error' : 'preferred-name-help'}
              onChange={updateDraft}
            />
            {errors.preferredName ? (
              <p className="field-error" id="preferred-name-error">
                {errors.preferredName}
              </p>
            ) : (
              <p className="field-help" id="preferred-name-help">
                This name appears throughout GradPath.
              </p>
            )}
          </div>

          <div className="field">
            <label htmlFor="academic-interests">Academic interests</label>
            <input
              ref={interestsRef}
              id="academic-interests"
              name="interestsText"
              type="text"
              value={draft.interestsText}
              aria-invalid={Boolean(errors.interestsText)}
              aria-describedby={
                errors.interestsText ? 'academic-interests-help academic-interests-error' : 'academic-interests-help'
              }
              onChange={updateDraft}
            />
            <p className="field-help" id="academic-interests-help">
              Optional. Separate up to {PROFILE_LIMITS.interests} interests with commas.
            </p>
            {errors.interestsText ? (
              <p className="field-error" id="academic-interests-error">
                {errors.interestsText}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="career-goal">
              Academic or career goal <span className="required-label">Required</span>
            </label>
            <textarea
              ref={careerGoalRef}
              id="career-goal"
              name="careerGoal"
              value={draft.careerGoal}
              rows="5"
              maxLength={PROFILE_LIMITS.careerGoal}
              aria-invalid={Boolean(errors.careerGoal)}
              aria-describedby={errors.careerGoal ? 'career-goal-error' : 'career-goal-help'}
              onChange={updateDraft}
            />
            {errors.careerGoal ? (
              <p className="field-error" id="career-goal-error">
                {errors.careerGoal}
              </p>
            ) : (
              <p className="field-help" id="career-goal-help">
                {draft.careerGoal.length}/{PROFILE_LIMITS.careerGoal} characters
              </p>
            )}
          </div>
        </section>

        <section className="card form-section form-section--read-only" aria-labelledby="official-information-heading">
          <div className="card-heading-row">
            <h2 id="official-information-heading">Official academic information</h2>
            <span className="read-only-badge">Read only</span>
          </div>
          <p className="field-help">
            Contact your academic program if this information needs to be corrected.
          </p>
          <dl className="definition-grid">
            <div>
              <dt>Program</dt>
              <dd>{profile.graduateProgram}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{profile.studentStatus}</dd>
            </div>
            <div>
              <dt>Specialization</dt>
              <dd>{profile.specialization || 'No specialization selected.'}</dd>
            </div>
            <div>
              <dt>Course history</dt>
              <dd>
                {profile.courseHistory.length
                  ? `${profile.courseHistory.length} completed courses`
                  : 'No completed courses to display yet.'}
              </dd>
            </div>
          </dl>
        </section>

        <div className="form-actions">
          <button className="button button--secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button--primary" type="submit">
            Save changes
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileEditForm

