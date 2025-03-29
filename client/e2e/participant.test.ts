import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeProject, fakeUser } from './utils/fakeData'

test.describe.serial('particiapants', () => {
  const projectOwner = fakeUser()
  test('user can add participant', async ({ page }) => {
    const project = fakeProject()
    const user = fakeUser({ name: 'Mario' })
    await page.goto('/signup')

    const form = page.getByRole('form', { name: 'Signup' })

    await form.locator('input[data-testid="name"]').fill(user.name)
    await form.locator('input[type="email"]').fill(user.email)
    await form.locator('input[type="password"]').fill(user.password)
    await form.locator('button[type="submit"]').click()

    await page.waitForURL('/dashboard/profile')
    const logoutButton = page.getByTestId('logout')

    await logoutButton.click()

    await asUser(page, projectOwner, async () => {
      await page.goto('/dashboard/projects/new')

      const form = page.getByRole('form', { name: 'NewProject' })
      await form.getByRole('textbox', { name: 'Name' }).fill(project.name)
      await form.getByRole('textbox', { name: 'Description' }).fill(project.description)

      await form.locator('button[type="submit"]').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/details$/
      )

      await page.getByTestId('addParticipant').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/add-participant$/
      )

      await page.getByTestId('search').fill(user.name)
      await page.locator('[data-testid="add"]').first().click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/details$/
      )

      const listItems = page.locator('ul > li')
      await expect(listItems).toHaveCount(2)
    })
  })
})
