/**
 * OGP 画像（public/og/<page>.png, 1200×630）を scripts/og/template.html から書き出す。
 * 文言やデザインを変えたら手元で実行し、生成された PNG をコミットする（ビルド時には実行しない）。
 *
 *   npm i --no-save puppeteer-core && node scripts/og/render.js
 *
 * Chrome は /Applications/Google Chrome.app を使う（CHROME_PATH で上書き可）。
 */
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const PAGES = ['home', 'about', 'service', 'news', 'recruit', 'contact'];
const OUT = path.join(__dirname, '../../public/og');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
  for (const key of PAGES) {
    await page.goto(`file://${path.join(__dirname, 'template.html')}?page=${key}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('body[data-ready="1"]');
    const file = path.join(OUT, `${key}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log('wrote', path.relative(process.cwd(), file));
  }
  await browser.close();
})();
