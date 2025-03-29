import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeProject, fakeUser } from './utils/fakeData'

test.describe.serial('task', () => {
  const projectOwner = fakeUser()
  test('user can add task', async ({ page }) => {
    const project = fakeProject()
    await asUser(page, projectOwner, async () => {
      await page.goto('/dashboard/projects/new')

      const form = page.getByRole('form', { name: 'NewProject' })
      await form.getByRole('textbox', { name: 'Name' }).fill(project.name)
      await form.getByRole('textbox', { name: 'Description' }).fill(project.description)

      await form.locator('button[type="submit"]').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/details$/
      )

      await page.getByTestId('tasks').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/tasks$/
      )

      await page.getByTestId('addTask').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/add-task$/
      )

      const taskForm = page.getByRole('form', { name: 'NewTask' })
      await taskForm.getByRole('textbox', { name: 'Name' }).fill('Job')
      await taskForm
        .getByRole('textbox', { name: 'Description' })
        .fill('Some Job description as a placeholder')
      await taskForm.getByRole('spinbutton', { name: 'Duration' }).fill('60')

      await taskForm.locator('button[type="submit"]').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/add-task$/
      )

      const taskTitle = page.getByTestId('TaskName')

      await expect(taskTitle).toContainText('Job')
    })
  })
})
