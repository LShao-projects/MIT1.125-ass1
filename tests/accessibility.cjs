const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const axePath=process.env.AXE_MODULE||require.resolve('axe-core/axe.min.js');
const fs=require('node:fs');
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const checks=[];
  try{
    const page=await browser.newPage();
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:1000});
      await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:4173');
      await page.waitForFunction(()=>document.querySelector('#kpi-total').textContent==='15,508');
      await page.addScriptTag({path:axePath});
      const report=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}));
      const violations=report.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
      console.log(JSON.stringify({width,violations},null,2));checks.push({width,violations,passes:report.passes.length});
    }
    fs.writeFileSync('docs/accessibility-verification.json',JSON.stringify(checks,null,2));
    if(checks.some(c=>c.violations.length))process.exitCode=1;
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
