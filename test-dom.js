const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/workspace');
  await page.waitForTimeout(3000);
  const element = await page.$('[data-testid="map-selection-toggle"]');
  if (element) {
    console.log("FOUND");
  } else {
    console.log("NOT FOUND");
    const html = await page.content();
    require('fs').writeFileSync('debug.html', html);
  }
  await browser.close();
})();
