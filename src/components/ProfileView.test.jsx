import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { sampleProfile } from '../data/sampleProfile.js'
import ProfileView from './ProfileView.jsx'

describe('ProfileView', () => {
  it('shows understandable empty states for missing optional information', () => {
    render(
      <ProfileView
        profile={{
          ...sampleProfile,
          specialization: null,
          academicInterests: [],
          careerGoal: '',
          courseHistory: [],
        }}
        onEdit={vi.fn()}
      />,
    )

    expect(screen.getAllByText('No specialization selected.')).toHaveLength(2)
    expect(screen.getByText('No academic interests added yet.')).toBeInTheDocument()
    expect(screen.getByText('No academic or career goal added yet.')).toBeInTheDocument()
    expect(screen.getByText('No completed courses to display yet.')).toBeInTheDocument()
  })

  it('labels official academic information as read only', () => {
    render(<ProfileView profile={sampleProfile} onEdit={vi.fn()} />)

    expect(screen.getAllByText('Official · read only')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Edit profile' })).toBeEnabled()
  })
})
