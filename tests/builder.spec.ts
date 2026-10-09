import { test, expect } from '@playwright/test';


const PREFIX = 'PW list';

// delete anything this test created, even if it failed halfway
test.afterEach(async ({ request }) => {
  const res = await request.get('/api/wordlist');
  const lists: { id: number; name: string }[] = await res.json();
  for (const list of lists.filter(l => l.name.startsWith(PREFIX))) {
    await request.delete(`/api/wordlist?id=${list.id}`);
  }
});

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/manage');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Manage/);




});

test('builder: create, rename,delete a word list', async({page}) => {
    const name = `${PREFIX} ${Date.now()}`;
    const renamed = `${name} renamed`;
    await page.goto('http://localhost:3000/manage');


    await page.getByPlaceholder('Enter new list').fill(name);
    await page.getByRole('button',{name:'Add List'}).click();
    const row = page.locator('.manage-list-item', {hasText:name});
    await expect(row).toBeVisible();

    await page.reload();



    await row.getByRole('button', { name: 'Edit' }).click();
    await page.locator('.manage-list-item input.manage-input').fill(renamed);
    await page.getByRole('button', { name: 'Save' }).click();
    const renamedRow = page.locator('.manage-list-item', { hasText: renamed });
    await expect(renamedRow).toBeVisible()

    await renamedRow.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText(renamed)).toHaveCount(0);
    


});
