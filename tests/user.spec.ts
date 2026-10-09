import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:3000/wordle');

  // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Wordle/);

    await page.getByRole('button', {name: 'θ', exact: true}).click();
    await page.getByRole('button', {name: 's', exact: true}).click();

    const firstRow = page.locator('.grid-row').first();
    await expect(firstRow.locator('div').nth(0)).toHaveText('θ');
    await expect(firstRow.locator('div').nth(1)).toHaveText('s');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Download HTML'}).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('phoneme-wordle.html')

});