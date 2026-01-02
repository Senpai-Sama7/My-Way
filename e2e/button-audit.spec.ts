import { test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';

test('audit all buttons on standard pages', async ({ page }) => {
  test.setTimeout(120 * 1000); // 2 minutes

  const shotsDir = path.join(process.cwd(), 'screenshots/buttons');
  await fs.mkdir(shotsDir, { recursive: true });

  // 1. Seed Session for /learning access
  const fallbackTextPath = path.join(process.cwd(), 'upload/2509.13348v4-excerpt.txt');
  const fallbackText = await fs.readFile(fallbackTextPath, 'utf-8');
  
  // We need to go to a page to set localStorage, so we go to / first
  await page.goto('/');
  await page.evaluate((text) => {
      const session = {
        materialTitle: 'PDF Excerpt',
        category: 'Imported',
        sections: [{ title: 'Excerpt', content: text }],
      }
      localStorage.setItem('learnMyWay.session', JSON.stringify(session))
  }, fallbackText.slice(0, 2000));

  // Define pages to audit
  const pages = [
      { path: '/', name: 'home' },
      { path: '/learning', name: 'learning' },
      { path: '/tools', name: 'tools' },
      { path: '/settings', name: 'settings' }
  ];

  for (const p of pages) {
      console.log(`Navigating to ${p.path}...`);
      await page.goto(p.path);
      // Wait for network idle to ensure content is loaded
      await page.waitForLoadState('networkidle');
      // Extra wait for any animations or hydrated components
      await page.waitForTimeout(1000);

      const buttons = await page.getByRole('button').all();
      console.log(`Found ${buttons.length} buttons on ${p.name}`);

      for (let i = 0; i < buttons.length; i++) {
          const btn = buttons[i];
          if (await btn.isVisible()) {
              await btn.scrollIntoViewIfNeeded();
              
              const textContent = (await btn.textContent()) || '';
              // Clean filename
              const cleanText = textContent.trim().substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
              const filename = `${p.name}_btn_${i}_${cleanText}.png`;
              
              await btn.screenshot({ path: path.join(shotsDir, filename) });
          }
      }
      // Take a full page screenshot too just to see context
      await page.screenshot({ path: path.join(shotsDir, `${p.name}_full.png`), fullPage: true });
  }
});
