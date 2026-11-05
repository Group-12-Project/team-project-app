import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { PROFILE_STORAGE_KEY } from './services/profileService.js'

describe('GradPath application shell', () => {
  it('opens the student profile from a visible navigation action', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/'

    render(<App />)

    await user.click(screen.getByRole('link', { name: 'View my profile' }))

    expect(await screen.findByRole('heading', { name: 'My Profile' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'James Peterson' })).toBeInTheDocument()
    expect(screen.getAllByText('M.S. Computer Science')).toHaveLength(2)
    expect(screen.getByText('Human-computer interaction')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Course history' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/profile')
  })

  it('saves profile changes, confirms success, and restores them after a refresh', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/profile'
    const firstRender = render(<App />)

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const preferredName = await screen.findByLabelText(/preferred name/i)
    const interests = screen.getByLabelText(/academic interests/i)
    const careerGoal = screen.getByLabelText(/academic or career goal/i)
    await user.clear(preferredName)
    await user.type(preferredName, 'Jamie Peterson')
    await user.clear(interests)
    await user.type(interests, 'Artificial intelligence, Accessible design')
    await user.clear(careerGoal)
    await user.type(careerGoal, 'Build accessible software for graduate students.')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('Your profile changes were saved successfully.'),
    ).toHaveAttribute('role', 'status')
    expect(screen.getByRole('heading', { name: 'Jamie Peterson' })).toBeInTheDocument()
    expect(screen.getByText('Artificial intelligence')).toBeInTheDocument()

    const storedProfile = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY))
    expect(storedProfile.preferredName).toBe('Jamie Peterson')
    expect(storedProfile.courseHistory).toHaveLength(3)

    firstRender.unmount()
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Jamie Peterson' })).toBeInTheDocument()
    expect(screen.getByText('Build accessible software for graduate students.')).toBeInTheDocument()
  })

  it('cancels editing without changing the saved profile', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/profile'
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const preferredName = await screen.findByLabelText(/preferred name/i)
    await user.clear(preferredName)
    await user.type(preferredName, 'Unsaved Name')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(await screen.findByRole('heading', { name: 'James Peterson' })).toBeInTheDocument()
    expect(screen.queryByText('Unsaved Name')).not.toBeInTheDocument()
    expect(window.localStorage.getItem(PROFILE_STORAGE_KEY)).toBeNull()
  })

  it('keeps the draft open and reports a browser-storage failure', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/profile'
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('Storage unavailable', 'QuotaExceededError')
    })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    await screen.findByRole('heading', { name: 'Edit profile' })
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not save your profile in this browser.',
    )
    expect(screen.getByRole('heading', { name: 'Edit profile' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/profile/edit')
  })
})
