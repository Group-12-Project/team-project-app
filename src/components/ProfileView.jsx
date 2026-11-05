function EmptyState({ children }) {
  return <p className="empty-state">{children}</p>
}

function ProfileView({ profile, onEdit }) {
  const creditsRemaining = Math.max(profile.creditsRequired - profile.creditsCompleted, 0)
  const progress = Math.min(
    Math.round((profile.creditsCompleted / profile.creditsRequired) * 100),
    100,
  )

  return (
    <div className="profile-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Student profile</p>
          <h1>My Profile</h1>
          <p className="page-intro">
            Review the academic information GradPath uses to support your degree planning.
          </p>
        </div>
        <span className="status-pill">{profile.studentStatus}</span>
      </header>

      <section className="card profile-summary" aria-labelledby="profile-name">
        <div className="profile-avatar" aria-hidden="true">
          {profile.preferredName
            .split(' ')
            .map((name) => name[0])
            .join('')
            .slice(0, 2)}
        </div>
        <div>
          <h2 id="profile-name">{profile.preferredName}</h2>
          <p className="profile-summary__program">{profile.graduateProgram}</p>
          <p className="profile-summary__specialization">
            {profile.specialization || 'No specialization selected.'}
          </p>
        </div>
      </section>

      <section className="card card--accent" aria-labelledby="degree-progress-heading">
        <div className="card-heading-row">
          <div>
            <p className="card-kicker">Degree progress</p>
            <h2 id="degree-progress-heading">
              {profile.creditsCompleted} of {profile.creditsRequired} credits completed
            </h2>
          </div>
          <strong>{progress}%</strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Degree credits completed"
          aria-valuemin="0"
          aria-valuemax={profile.creditsRequired}
          aria-valuenow={profile.creditsCompleted}
        >
          <span className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-caption">{creditsRemaining} credits remaining</p>
      </section>

      <div className="profile-grid">
        <section className="card" aria-labelledby="academic-information-heading">
          <div className="card-heading-row">
            <h2 id="academic-information-heading">Academic information</h2>
            <span className="read-only-badge">Official · read only</span>
          </div>
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
              <dt>Expected graduation</dt>
              <dd>{profile.expectedGraduation || 'Not available'}</dd>
            </div>
            <div>
              <dt>Current GPA</dt>
              <dd>{profile.gpa || 'Not available'}</dd>
            </div>
            <div>
              <dt>Credits remaining</dt>
              <dd>{creditsRemaining}</dd>
            </div>
          </dl>
        </section>

        <section className="card" aria-labelledby="academic-interests-heading">
          <h2 id="academic-interests-heading">Academic interests</h2>
          {profile.academicInterests.length ? (
            <ul className="tag-list">
              {profile.academicInterests.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          ) : (
            <EmptyState>No academic interests added yet.</EmptyState>
          )}
        </section>

        <section className="card" aria-labelledby="career-goal-heading">
          <h2 id="career-goal-heading">Academic and career goal</h2>
          {profile.careerGoal ? (
            <p className="goal-copy">{profile.careerGoal}</p>
          ) : (
            <EmptyState>No academic or career goal added yet.</EmptyState>
          )}
        </section>

        <section className="card card--wide" aria-labelledby="course-history-heading">
          <div className="card-heading-row">
            <h2 id="course-history-heading">Course history</h2>
            <span className="read-only-badge">Official · read only</span>
          </div>
          {profile.courseHistory.length ? (
            <ul className="course-list" aria-label="Completed course history">
              {profile.courseHistory.map((course) => (
                <li key={course.id}>
                  <div>
                    <strong>{course.code}</strong>
                    <span>{course.title}</span>
                  </div>
                  <span>{course.term || 'Term not available'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No completed courses to display yet.</EmptyState>
          )}
        </section>
      </div>

      <button className="button button--primary button--full" type="button" onClick={onEdit}>
        Edit profile
      </button>
    </div>
  )
}

export default ProfileView

