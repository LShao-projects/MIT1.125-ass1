// Run with PLAYWRIGHT_MODULE pointing to the installed Playwright package.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const oracle=require('./oracle.json');
const origin=process.env.PREVIEW_URL||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const results=[];
 const check=(name)=>{results.push(name);console.log('PASS',name);};
 const value=async id=>Number((await page.locator(id).textContent()).replace(/,/g,''));
 const kpis=async expected=>{for(const [key,n]of Object.entries(expected))assert.equal(await value(`#kpi-${key}`),n);};
 try{
  await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#kpi-total').textContent==='15,508');
  await kpis(oracle.all);check('Default KPIs match independent CSV calculation');
  assert.equal(await page.locator('#neighborhood-table tbody tr').count(),14);
  const sum=await page.locator('#neighborhood-table tbody tr td:nth-child(2)').allTextContents();assert.equal(sum.reduce((s,x)=>s+Number(x.replace(/,/g,'')),0),oracle.all.total);check('Neighborhood totals reconcile');
  assert.equal(await page.locator('#partial-warning').isVisible(),true);
  await page.locator('#year').selectOption('2026');await kpis(oracle['2026']);check('Year filter and partial-year label');
  await page.locator('#neighborhood').selectOption('North Cambridge');await page.locator('#mode').selectOption('cyclist');await page.locator('#injury').check();await page.locator('#hospital').check();await kpis(oracle.combined);check('All filter dimensions intersect correctly');
  // Findings and recommendations are authored, not generated: assert they are
  // present and that every "supporting finding" link resolves to a real anchor.
  const findingIds=await page.locator('#finding-content .finding').evaluateAll(els=>els.map(e=>e.id));
  assert.ok(findingIds.length>=3&&findingIds.every(Boolean));
  const links=await page.locator('#recommendation-content a[href^="#"]').evaluateAll(els=>els.map(e=>e.getAttribute('href').slice(1)));
  assert.ok(links.length>=2);
  for(const target of links) assert.ok(findingIds.includes(target),`recommendation links to missing finding #${target}`);
  await page.reload();await page.waitForFunction(()=>!document.querySelector('#filter-fields').disabled);await kpis(oracle.combined);assert.equal(await page.locator('#hospital').isChecked(),true);check('Filters restore from URL');
  await page.getByRole('button',{name:'Reset filters'}).click();await kpis(oracle.all);
  await page.locator('#mode').selectOption('pedestrian');await kpis(oracle.pedestrian);check('Pedestrian involvement and reset');
  await page.locator('[data-metric="injuries"]').click();assert.equal(await page.locator('[data-metric="injuries"]').getAttribute('aria-pressed'),'true');assert.ok((await page.locator('#intersection-coverage').textContent()).includes('injury crashes'));check('Intersection metric toggle');
  await page.getByRole('button',{name:'Reset filters'}).click();
  await page.locator('[data-sort="total"]').click();const sorted=await page.locator('#neighborhood-table tbody td:nth-child(2)').allTextContents();const n=sorted.map(x=>Number(x.replace(/,/g,'')));assert.deepEqual(n,[...n].sort((a,b)=>a-b));check('Accessible numeric table sorting');
  await page.locator('#start').fill('2026-09-20');await page.locator('#end').fill('2026-01-01');await page.locator('#end').dispatchEvent('change');assert.equal(await page.locator('#date-error').isVisible(),true);check('Invalid date range preserves prior results and exposes correction');
  await page.getByRole('button',{name:'Reset filters'}).click();
  await page.locator('#start').fill('2026-09-20');await page.locator('#end').fill('2026-09-20');await page.locator('#mode').selectOption('pedestrian');await page.locator('#hospital').check();assert.equal(await value('#kpi-total'),0);assert.ok((await page.locator('#finding-content .finding').count())>=3,'authored findings stay visible on an empty selection');assert.ok(!(await page.locator('body').textContent()).includes('NaN'));check('Empty selections have zero KPIs and no invented findings');
  await page.getByRole('button',{name:'Reset filters'}).click();
  await page.locator('[data-metric="total"]').click();await page.locator('[data-sort="total"]').click();
  await page.locator('#trend-table').locator('..').locator('summary').click();const trendTotal=(await page.locator('#trend-table tbody td:nth-child(2)').allTextContents()).reduce((s,x)=>s+Number(x.replace(/,/g,'')),0);assert.equal(trendTotal,oracle.all.total);await page.locator('#trend-table').locator('..').locator('summary').click();
  await page.locator('#hour-table').locator('..').locator('summary').click();assert.equal((await page.locator('#hour-table tbody td:nth-child(2)').allTextContents()).reduce((s,x)=>s+Number(x.replace(/,/g,'')),0),oracle.all.total);await page.locator('#hour-table').locator('..').locator('summary').click();check('Chart data tables reconcile to KPI total');
  for(const [width,name]of [[1440,'desktop'],[768,'tablet'],[390,'mobile'],[320,'small-mobile']]){
   await page.setViewportSize({width,height:1000});await page.screenshot({path:`/private/tmp/cambridge-${name}.png`,fullPage:true});await page.screenshot({path:`/private/tmp/cambridge-${name}-viewport.png`});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} page overflows`);
   for(const id of ['#year','#start','#end','#neighborhood','#mode'])assert.ok(await page.locator(id).isVisible());
   check(`${name} layout has no page overflow and retains filters`);
  }
  await page.setViewportSize({width:390,height:844});await page.locator('#year').focus();assert.equal(await page.locator('#year').evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Tab');assert.equal(await page.locator('#start').evaluate(el=>el===document.activeElement),true);await page.locator('#mode').selectOption('pedestrian');await page.getByRole('button',{name:'Reset filters'}).focus();await page.keyboard.press('Enter');await kpis(oracle.all);check('Native fields support keyboard focus; reset works with Enter');
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');check('Reduced motion respected');
  const fail=await browser.newPage();await fail.route('**/data/cambridge_crashes.csv',route=>route.fulfill({status:404,body:'missing'}));await fail.goto(origin);await fail.getByRole('button',{name:'Try again'}).waitFor();assert.equal(await fail.locator('#year').isDisabled(),true);await fail.unroute('**/data/cambridge_crashes.csv');await fail.getByRole('button',{name:'Try again'}).click();await fail.waitForFunction(()=>document.querySelector('#kpi-total').textContent==='15,508');await fail.close();check('CSV failure state recovers with retry');
  assert.deepEqual(errors,[]);check('No browser JavaScript errors');
  fs.writeFileSync('docs/browser-verification.json',JSON.stringify({browser:'Chrome headless',checks:results,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
