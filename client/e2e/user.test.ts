import { test, expect } from '@playwright/test'
import { asUser } from 'utils/api'
import { fakeUser } from 'utils/fakeData'

const user = fakeUser()

test.describe.serial('login and sign in', () => {
  const URL_LOGGED_IN = '/dashboard/profile'

  test('visitor can signup', async ({ page }) => {
    // Given (ARRANGE)
    await page.goto('/signup')

    // When (ACT)
    const form = page.getByRole('form', { name: 'Signup' })

    // We would prefer using getByRole, but flowbite components are
    // not linking labels with inputs
    await form.locator('input[data-testid="name"]').fill(user.name)
    await form.locator('input[type="email"]').fill(user.email)
    await form.locator('input[type="password"]').fill(user.password)
    await form.locator('button[type="submit"]').click()

    // Then (ASSERT)
    await page.waitForURL('/dashboard/profile')
  })

  test('visitor can not access dashboard before login', async ({ page }) => {
    await page.goto(URL_LOGGED_IN)

    await page.waitForURL('/login')
  })

  test('visitor can login', async ({ page }) => {
    await page.goto('/login')

    const form = page.getByRole('form', { name: 'Login' })
    await form.locator('input[type="email"]').fill(user.email)
    await form.locator('input[type="password"]').fill(user.password)
    await form.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(URL_LOGGED_IN)

    await page.reload()
    await expect(page).toHaveURL(URL_LOGGED_IN)
  })

  test('visitor can logout', async ({ page }) => {
    const user = fakeUser()

    await asUser(page, user, async () => {
      await page.goto(URL_LOGGED_IN)
      const logoutButton = page.getByTestId('logout')

      // When (ACT)
      await logoutButton.click()

      await expect(page).toHaveURL('/login')

      await page.goto(URL_LOGGED_IN)
      await expect(page).toHaveURL('/login')
    })
  })
})
