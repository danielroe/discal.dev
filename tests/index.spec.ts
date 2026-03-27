import { expect, test } from '@nuxt/test-utils/playwright'

test('home page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot()
})

test('og image for home page', async ({ page }) => {
  await page.goto('/_og/d/og.png')
  await expect(page).toHaveScreenshot()
})
