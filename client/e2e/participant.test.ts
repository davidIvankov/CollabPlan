import { test, expect } from '@playwright/test'
import { asUser, createTestProject, createUser } from './utils/api'
import { fakeProject, fakeUser } from './utils/fakeData'

test.describe.serial('particiapants', async () => {
  let projectId: string
  const projectOwner = fakeUser()
  const user = fakeUser({ name: 'Mario' })

  test.beforeAll(async () => {
    await createUser(user)
    await createUser(projectOwner)
  })

  test('user can invite participant', async ({ page }) => {
    await asUser(page, projectOwner, async () => {
      const projectInserted = await createTestProject(fakeProject())

      projectId = projectInserted.id

      await page.goto(`/dashboard/projects/${projectId}/details`)

      await page.getByTestId('addParticipant').click()

      await page.waitForURL(
        /\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\/add-participant$/
      )
      await page.getByTestId('search').fill(user.name)
      await page.getByTestId('top-row').first().click()
      await page.getByTestId('add').first().click()

      await expect(page.getByTestId('invitation-status').first()).toHaveText('Invitation sent')
    })
  })

  test('user can cancel invitation', async ({ page }) => {
    await asUser(page, projectOwner, async () => {
      await page.goto(`/dashboard/projects/${projectId}/add-participant`)
      await page.getByTestId('search').fill(user.name)
      await page.getByTestId('top-row').first().click()
      await page.getByTestId('cancel').click()

      await expect(page.getByTestId('invitation-status').first()).toHaveText('')
    })
  })
})
