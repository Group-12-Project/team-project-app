import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { sampleProfile } from '../data/sampleProfile.js'
import ProfileEditForm from './ProfileEditForm.jsx'

describe('ProfileEditForm', () => {
  it('keeps official fields display-only', () => {
    render(<ProfileEditForm profile={sampleProfile} onCancel={vi.fn()} onSave={vi.fn()} />)

    expect(screen.getByLabelText(/preferred name/i)).toBeRequired()
    expect(screen.getByLabelText(/academic interests/i)).toBeEnabled()
    expect(screen.getByLabelText(/academic or career goal/i)).toBeRequired()
    expect(screen.queryByRole('textbox', { name: /program/i })).not.toBeInTheDocument()
    expect(screen.getByText('Official academic information')).toBeInTheDocument()
    expect(screen.getByText(sampleProfile.graduateProgram)).toBeInTheDocument()
  })

  it('blocks an invalid save, explains errors, and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ProfileEditForm profile={sampleProfile} onCancel={vi.fn()} onSave={onSave} />)

    const preferredName = screen.getByLabelText(/preferred name/i)
    const careerGoal = screen.getByLabelText(/academic or career goal/i)
    await user.clear(preferredName)
    await user.clear(careerGoal)
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Enter your preferred name.')).toBeInTheDocument()
    expect(screen.getByText('Enter an academic or career goal.')).toBeInTheDocument()
    expect(preferredName).toHaveAttribute('aria-invalid', 'true')
    expect(preferredName).toHaveFocus()
  })

  it('submits normalized editable values while preserving official data', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ProfileEditForm profile={sampleProfile} onCancel={vi.fn()} onSave={onSave} />)

    const preferredName = screen.getByLabelText(/preferred name/i)
    const interests = screen.getByLabelText(/academic interests/i)
    const careerGoal = screen.getByLabelText(/academic or career goal/i)
    await user.clear(preferredName)
    await user.type(preferredName, 'Jamie Peterson')
    await user.clear(interests)
    await user.type(interests, 'AI, Databases, ai')
    await user.clear(careerGoal)
    await user.type(careerGoal, 'Build trustworthy learning software.')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).toHaveBeenCalledWith({
      ...sampleProfile,
      preferredName: 'Jamie Peterson',
      academicInterests: ['AI', 'Databases'],
      careerGoal: 'Build trustworthy learning software.',
    })
  })

  it('shows and focuses academic-interest limit feedback', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<ProfileEditForm profile={sampleProfile} onCancel={vi.fn()} onSave={onSave} />)

    const interests = screen.getByLabelText(/academic interests/i)
    await user.clear(interests)
    await user.type(interests, 'One, Two, Three, Four, Five, Six, Seven, Eight, Nine')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByText('Add no more than 8 academic interests.')).toBeInTheDocument()
    expect(interests).toHaveAttribute('aria-invalid', 'true')
    expect(interests).toHaveFocus()
  })

  it('cancels without submitting draft changes', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    const onSave = vi.fn()
    render(<ProfileEditForm profile={sampleProfile} onCancel={onCancel} onSave={onSave} />)

    await user.clear(screen.getByLabelText(/preferred name/i))
    await user.type(screen.getByLabelText(/preferred name/i), 'Unsaved Name')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
    expect(onSave).not.toHaveBeenCalled()
  })
})
