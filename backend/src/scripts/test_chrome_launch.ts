import { chromium } from 'playwright-core';

async function main() {
  console.log('Testing Google Chrome launch with playwright-core...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  const title = await page.title();
  console.log('Page title:', title);
  console.log('URL:', page.url());
  await browser.close();
  console.log('Chrome launch test succeeded!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
