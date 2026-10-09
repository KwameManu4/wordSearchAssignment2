import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/manage');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Manage/);
});

test('builder: create, rename, delete a word list', async ({ page, request }, testInfo) => {
  // unique per browser, so tests running in parallel never share a name
  const name = `PW list ${testInfo.project.name} ${Date.now()}`;
  const renamed = `${name} renamed`;

  try {
    // The page fetches its lists once React has hydrated, so waiting for that response
    // means the Add List button is wired up. Without it, WebKit can type and click first.
    const listsLoaded = page.waitForResponse(r => r.url().includes('/api/wordlist') && r.request().method() === 'GET');
    await page.goto('/manage');
    await listsLoaded;

    // create
    await page.getByPlaceholder('Enter new list').fill(name);
    await page.getByRole('button', { name: 'Add List' }).click();
    const row = page.locator('.manage-list-item', { hasText: name });
    await expect(row).toBeVisible();

    // rename: while editing, the name sits in an input's value, not in text
    await row.getByRole('button', { name: 'Edit' }).click();
    await page.locator('.manage-list-item input.manage-input').fill(renamed);
    await page.getByRole('button', { name: 'Save' }).click();
    const renamedRow = page.locator('.manage-list-item', { hasText: renamed });
    await expect(renamedRow).toBeVisible();

    // delete
    await renamedRow.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(renamed)).toHaveCount(0);
  } finally {
    // If a step failed before the delete, remove only THIS test's list (its two possible
    // names). A file-wide cleanup would delete lists other parallel tests are still using.
    const lists: { id: number; name: string }[] = await (await request.get('/api/wordlist')).json();
    for (const list of lists.filter(l => l.name === name || l.name === renamed)) {
      await request.delete(`/api/wordlist?id=${list.id}`);
    }
  }
});
