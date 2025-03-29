import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeProject, fakeUser } from './utils/fakeData'

test.describe.serial('project', () => {
  const project = fakeProject()

  test('user can create an project', async ({ page }) => {
    await asUser(page, fakeUser(), async () => {
      await page.goto('/dashboard/projects/new')

      const form = page.getByRole('form', { name: 'NewProject' })
      await form.getByRole('textbox', { name: 'Name' }).fill(project.name)
      await form.getByRole('textbox', { name: 'Description' }).fill(project.description)

      await form.locator('button[type="submit"]').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/details$/
      )

      const projectName = page.getByText(project.name)

      await expect(projectName).toBeVisible()
    })
  })
})
