import { test, expect } from '@playwright/test'

test.describe('Autonomy Regression Skeleton', () => {
  test('prompt -> taskflow load ack -> gate ready -> simulation autoplay', async ({ page }) => {
    // TODO: Replace with deployed URL in CI.
    await page.goto('http://localhost:5173')

    // Navigate to Tasks tab.
    await page.getByText('Tasks', { exact: true }).click()

    // Enter a deterministic prompt that should pick an existing scene object.
    const prompt = page.getByLabel('AI task description')
    await prompt.fill('Pick Cylinder A and place it on the shelf drop zone')

    await page.getByRole('button', { name: 'Generate motion' }).click()

    // Open AI Results and assert verification reaches Ready.
    await page.getByRole('button', { name: 'AI Results' }).click()
    await expect(page.getByText('Pre-Sim Verification')).toBeVisible()
    await expect(page.getByText('Ready')).toBeVisible({ timeout: 30000 })

    // Verify that the app navigates to Simulate and autoplay starts.
    await expect(page.getByText('Simulation player')).toBeVisible({ timeout: 8000 })

    // Optional follow-up assertion for a visible playback state can be added when a stable selector exists.
    // Example (future): expect play button to toggle into pause state.
  })

  test('autoplay blocked when verification is not ready', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.getByText('Tasks', { exact: true }).click()

    // Force a likely-invalid prompt to exercise blocked path.
    const prompt = page.getByLabel('AI task description')
    await prompt.fill('Pick unknown object Z and move through the table at max speed')

    await page.getByRole('button', { name: 'Generate motion' }).click()
    await page.getByRole('button', { name: 'AI Results' }).click()

    // Skeleton assertion: verification should eventually show Blocked.
    await expect(page.getByText('Blocked')).toBeVisible({ timeout: 30000 })

    // App should remain in Tasks flow or avoid autoplay. Keep this conservative until selectors are finalized.
    await expect(page.getByText('Simulation player')).not.toBeVisible()
  })
})
