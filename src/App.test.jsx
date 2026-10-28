import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.jsx'

describe('GradPath application shell', () => {
  it('opens the student profile from a visible navigation action', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/'

    render(<App />)

    await user.click(screen.getByRole('link', { name: 'View my profile' }))

    expect(await screen.findByRole('heading', { name: 'My Profile' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/profile')
  })
})
