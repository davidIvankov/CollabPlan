import { test, expect } from '@playwright/test'
import { asUser } from './utils/api'
import { fakeProject, fakeUser } from './utils/fakeData'

test.describe.serial('task', () => {
  let projectId: string
  const projectOwner = fakeUser()
  const project = fakeProject()
  test('user can add task', async ({ page }) => {
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

      const url = page.url()
      const match = url.match(/\/([a-f0-9-]{36})\/tasks$/)
      projectId = match?.[1]

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
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/tasks$/
      )

      const taskTitle = page.getByTestId('TaskName')

      await expect(taskTitle).toContainText('Job')
    })
  })

  test('user can assign task to himself', async ({ page }) => {
    await asUser(page, projectOwner, async () => {
      await page.goto(`/dashboard/projects/${projectId}/tasks`)
      await page.getByTestId('Schedule').click()

      await page.getByTestId('assign').click()

      await expect(page.getByTestId('assignedTasks').locator('> *')).toHaveCount(1)
    })
  })

  test('user can unassign tasks assigned to him', async ({ page }) => {
    await asUser(page, projectOwner, async () => {
      await page.goto(`/dashboard/projects/${projectId}/tasks`)
      await page.getByTestId('unassign').click()

      await expect(page.getByTestId('assignedTasks').locator('> *')).toHaveCount(0)
    })
  })
})
