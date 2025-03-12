import { test, expect } from '@playwright/test'
import { asUser } from 'utils/api'
import { fakeUser } from 'utils/fakeData'

const user = fakeUser()

// We are grouping these tests in a serial block to clearly
// indicate that these tests should be run in the provided order.
// However, ideally we would like to run each test in isolation.
// That would allow us to develop faster and to see more clearly
// which part of our flow is broken.
// In this particular case, we might want to run the signup and
// login tests one after the other because we want to make sure
// that the signup + login flow works.
test.describe.serial('login and sign in', () => {
  test('visitor can see home page', async ({ page }) => {
    await page.goto('/')

    expect(page.getByTestId('app-name'))
  })
})
