import puppeteer from 'puppeteer-core';

const pages = [
  { name: 'overview', path: '/dashboard/overview' },
  { name: 'bookings', path: '/dashboard/bookings' },
  { name: 'routes', path: '/dashboard/routes' },
  { name: 'trips', path: '/dashboard/trips' },
  { name: 'analytics', path: '/dashboard/analytics' },
  { name: 'partners', path: '/dashboard/partners' },
  { name: 'support', path: '/dashboard/support' },
  { name: 'partner-overview', path: '/dashboard/partner-overview' },
  { name: 'partner-vehicles', path: '/dashboard/partner-vehicles' },
  { name: 'partner-drivers', path: '/dashboard/partner-drivers' },
  { name: 'partner-accounting', path: '/dashboard/partner-accounting' },
  { name: 'partner-issues', path: '/dashboard/partner-issues' },
  { name: 'partner-support', path: '/dashboard/partner-support' },
];

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  headless: true,
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

for (const p of pages) {
  try {
    await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: `/home/claude/fresh/screenshots/${p.name}.png`, fullPage: false });
    console.log(`✓ ${p.name}`);
  } catch (e) {
    console.log(`✗ ${p.name}: ${e.message}`);
  }
}

await browser.close();
console.log('Done');
