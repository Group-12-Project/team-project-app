import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import App from './App.jsx'
import { sampleProfile } from './data/sampleProfile.js'

it('loads from the API repository and waits for a successful save before confirming', async () => {
  window.location.hash = '#/profile'
  let finishSave
  const repository = {
    load: vi.fn().mockResolvedValue(sampleProfile),
    save: vi.fn(() => new Promise((resolve) => { finishSave = resolve })),
  }
  const user = userEvent.setup()
  render(<App repository={repository} />)
  await user.click(await screen.findByRole('button', { name: 'Edit profile' }))
  await user.click(await screen.findByRole('button', { name: 'Save changes' }))
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
  expect(screen.queryByText('Your profile changes were saved successfully.')).not.toBeInTheDocument()
  finishSave({ ...sampleProfile, preferredName: 'Saved Student' })
  expect(await screen.findByRole('heading', { name: 'Saved Student' })).toBeInTheDocument()
})

it('preserves the draft when a database save fails', async () => {
  window.location.hash = '#/profile/edit'
  const user = userEvent.setup()
  render(<App repository={{ load: async () => sampleProfile, save: async () => { throw new Error('Unavailable') } }} />)
  const field = await screen.findByLabelText(/preferred name/i)
  await user.clear(field)
  await user.type(field, 'Unsaved Student')
  await user.click(screen.getByRole('button', { name: 'Save changes' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Your draft is still available')
  expect(field).toHaveValue('Unsaved Student')
})

it('reports load failures and retries instead of displaying fictional fallback data', async () => {
  const repository = { load: vi.fn().mockRejectedValueOnce(new Error()).mockResolvedValueOnce(sampleProfile) }
  const user = userEvent.setup()
  window.location.hash = '#/profile'
  render(<App repository={repository} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('could not load')
  expect(screen.queryByText('James Peterson')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Try again' }))
  expect(await screen.findByRole('heading', { name: 'James Peterson' })).toBeInTheDocument()
})

it('maps server interest errors to the input and focuses it', async () => {
  window.location.hash = '#/profile/edit'
  const user = userEvent.setup()
  render(<App repository={{ load: async () => sampleProfile, save: async () => { throw Object.assign(new Error('Invalid'), { fields: { academicInterests: 'Choose fewer interests.' } }) } }} />)
  await user.click(await screen.findByRole('button', { name: 'Save changes' }))
  const field = screen.getByLabelText('Academic interests')
  expect(await screen.findByText('Choose fewer interests.')).toBeInTheDocument()
  expect(field).toHaveFocus()
  expect(field).toHaveAttribute('aria-invalid', 'true')
})

it('lets an unconfirmed save check stored values while preserving its draft', async () => {
  window.location.hash = '#/profile/edit'
  const load = vi.fn().mockResolvedValueOnce(sampleProfile).mockResolvedValueOnce({ ...sampleProfile, preferredName: 'Committed Student' })
  const user = userEvent.setup()
  render(<App repository={{ load, save: async () => { throw Error('Lost response') } }} />)
  const field = await screen.findByLabelText(/preferred name/i)
  await user.clear(field)
  await user.type(field, 'Draft Student')
  await user.click(screen.getByRole('button', { name: 'Save changes' }))
  await user.click(await screen.findByRole('button', { name: 'Check stored values' }))
  expect(await screen.findByText('Committed Student')).toBeInTheDocument()
  expect(field).toHaveValue('Draft Student')
})

it('shows missing profile without enabling editing or loading fallback data', async () => {
  window.location.hash = '#/profile'
  render(<App repository={{ load: async () => { throw Object.assign(Error(), { code: 'PROFILE_NOT_FOUND' }) } }} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('not found')
  expect(screen.queryByRole('button', { name: 'Edit profile' })).not.toBeInTheDocument()
})

it('cancels a draft without sending an update', async () => {
  window.location.hash = '#/profile/edit'
  const save = vi.fn()
  const user = userEvent.setup()
  render(<App repository={{ load: async () => sampleProfile, save }} />)
  const field = await screen.findByLabelText(/preferred name/i)
  await user.clear(field)
  await user.type(field, 'Discard this draft')
  await user.click(screen.getByRole('button', { name: 'Cancel' }))
  expect(await screen.findByRole('heading', { name: sampleProfile.preferredName })).toBeInTheDocument()
  expect(save).not.toHaveBeenCalled()
})

it('shows loading, renders empty data, and keeps academic fields read-only', async () => {
  window.location.hash = '#/profile'
  let resolve
  const user = userEvent.setup()
  render(<App repository={{ load: () => new Promise((done) => { resolve = done }) }} />)
  expect(screen.getByRole('status')).toHaveTextContent('Loading your profile')
  resolve({ ...sampleProfile, academicInterests: [], courseHistory: [], specialization: null })
  await user.click(await screen.findByRole('button', { name: 'Edit profile' }))
  expect(screen.getByLabelText('Academic interests')).toHaveValue('')
  expect(screen.getByText('No specialization selected.')).toBeInTheDocument()
  expect(screen.getByText('No completed courses to display yet.')).toBeInTheDocument()
  expect(screen.getAllByRole('textbox')).toHaveLength(3)
})
