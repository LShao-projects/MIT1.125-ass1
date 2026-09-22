import {groupBy, summarize, number, escapeHTML as esc} from './data.js';
const empty='<div class="empty">No matching crashes. Try widening the date range or resetting your filters.</div>';
export const hourLabel=h=>`${h%12||12}${h<12?'am':'pm'}`;
const table=(heads,rows)=>`<table><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function ticks(max){const raw=Math.max(1,max/4),power=10**Math.floor(Math.log10(raw)),factor=raw/power;const step=(factor<=1?1:factor<=2?2:factor<=5?5:10)*power;const ceiling=Math.max(step,Math.ceil(max/step)*step);return {ceiling,values:Array.from({length:Math.round(ceiling/step)+1},(_,i)=>i*step)};}
export function isPartialTrendYear(year,state,extent){
  // This snapshot's Jan 1, 2016 gap is disclosed in a note, not a partial-year label.
  const notedStart=year===2016&&extent.min==='2016-01-02'&&state.start===extent.min;
  return (year===+extent.max.slice(0,4)&&extent.max.slice(5)<'12-31')||
    (state.start>`${year}-01-01`&&!notedStart)||state.end<`${year}-12-31`;
}
export function renderTrend(rows,state,extent){
  const target=document.querySelector('#trend'),dataTarget=document.querySelector('#trend-table');
  if(!rows.length){target.innerHTML=empty;dataTarget.innerHTML='No matching records.';return;}
  const first=+state.start.slice(0,4),last=+state.end.slice(0,4);
  const groups=groupBy(rows,'year');
  const years=Array.from({length:last-first+1},(_,i)=>first+i);
  const data=years.map(year=>{const records=groups.get(year)||[];return {year,total:records.length,motorist:records.filter(r=>r.motorist>0).length,cyclist:records.filter(r=>r.cyclist>0).length,pedestrian:records.filter(r=>r.pedestrian>0).length,
    partial:isPartialTrendYear(year,state,extent)};});
  const width=720,height=330,left=54,right=30,top=35,bottom=47,plotH=height-top-bottom;
  const {ceiling,values}=ticks(Math.max(...data.flatMap(d=>[d.motorist,d.cyclist,d.pedestrian])));
  const x=i=>left+(years.length===1?(width-left-right)/2:i*(width-left-right)/(years.length-1));
  const y=v=>top+plotH-v/ceiling*plotH;
  let svg=`<svg viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="trend-title trend-desc"><title id="trend-title">Yearly crashes by recorded road-user involvement</title><desc id="trend-desc">Three overlapping road-user series. Partial years are shaded with isolated points. Exact values follow in the expandable table.</desc>`;
  for(const [i,d] of data.entries())if(d.partial)svg+=`<rect x="${x(i)-21}" y="${top-20}" width="42" height="${plotH+36}" rx="5" fill="var(--warning)"/>`;
  values.forEach(v=>{svg+=`<line class="gridline" x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}"/><text x="${left-10}" y="${y(v)+5}" text-anchor="end">${number(v)}</text>`;});
  const modes=[['motorist','var(--accent)',''],['cyclist','var(--blue)','7 4'],['pedestrian','var(--orange)','2 4']];
  for(const [mode,color,dash] of modes){
    for(let i=1;i<data.length;i++)if(!data[i].partial&&!data[i-1].partial)svg+=`<path d="M ${x(i-1)} ${y(data[i-1][mode])} L ${x(i)} ${y(data[i][mode])}" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="${dash}"/>`;
    data.forEach((d,i)=>{svg+=`<circle class="chart-value-target" tabindex="0" role="button" aria-label="${d.year}${d.partial?' (partial)':''}: ${number(d[mode])} ${mode}-involved crashes" data-value="${number(d[mode])}" data-context="${d.year}${d.partial?' (partial)':''} · ${mode}" cx="${x(i)}" cy="${y(d[mode])}" r="6" fill="var(--surface)" stroke="${color}" stroke-width="2.5"><title>${d.year}${d.partial?' (partial)':''}: ${number(d[mode])} ${mode}-involved crashes</title></circle>`;});
  }
  data.forEach((d,i)=>{svg+=`<text x="${x(i)}" y="${height-23}" text-anchor="middle">${d.year}</text>${d.partial?`<text x="${x(i)}" y="${height-5}" text-anchor="middle" style="font-size:11px;fill:var(--orange)">partial</text>`:''}`;});
  target.innerHTML=svg+'</svg>';
  bindChartValues(target);
  dataTarget.innerHTML=table(['Year','All crashes','Motorist','Cyclist','Pedestrian'],data.map(d=>[`${d.year}${d.partial?' (partial period)':''}`,number(d.total),number(d.motorist),number(d.cyclist),number(d.pedestrian)]));
}
export function intersectionGroups(rows){return [...groupBy(rows.filter(r=>r.intersection),'intersection')].map(([name,list])=>({name,...summarize(list)}));}
export function renderIntersections(rows,metric){
  const ranked=intersectionGroups(rows).filter(d=>d[metric]>0).sort((a,b)=>b[metric]-a[metric]||a.name.localeCompare(b.name)).slice(0,8);
  const unit={total:'crashes',injuries:'injury crashes',vulnerable:'pedestrian / cyclist crashes'}[metric];
  document.querySelector('#intersections').innerHTML=ranked.length?ranked.map(d=>`<div class="rank-row"><div class="rank-label"><span>${esc(d.name)}</span><strong aria-label="${number(d[metric])} ${unit}">${number(d[metric])}</strong></div><div class="rank-track" aria-hidden="true"><div class="rank-fill" style="width:${100*d[metric]/ranked[0][metric]}%"></div></div></div>`).join(''):`<div class="empty">No named intersections with ${unit} in this selection.</div>`;
  const known=rows.filter(r=>r.intersection).length;
  document.querySelector('#intersection-coverage').textContent=`${number(known)} of ${number(rows.length)} selected crashes have both intersection streets recorded. Other records remain in the KPIs, trend, and hourly chart. Values count ${unit}.`;
}
export function renderHourly(rows){
  const counts=Array.from({length:24},(_,h)=>rows.filter(r=>r.hour===h).length);
  if(!rows.length){document.querySelector('#hourly').innerHTML=empty;document.querySelector('#hour-table').textContent='No matching records.';return;}
  const width=1150,height=270,left=50,right=14,top=28,bottom=39,plotH=height-top-bottom,step=(width-left-right)/24;
  const {ceiling,values}=ticks(Math.max(...counts)),y=v=>top+plotH-v/ceiling*plotH,peak=Math.max(...counts);
  let svg=`<svg viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="hour-title hour-desc"><title id="hour-title">Crashes by hour of day</title><desc id="hour-desc">Each bar counts selected crashes in one local-clock hour. The darkest bars have the highest counts. Exact values are in the expandable table.</desc>`;
  values.forEach(v=>{svg+=`<line class="gridline" x1="${left}" y1="${y(v)}" x2="${width-right}" y2="${y(v)}"/><text x="${left-10}" y="${y(v)+5}" text-anchor="end">${number(v)}</text>`;});
  counts.forEach((v,h)=>{const x=left+h*step+4;svg+=`<rect class="chart-value-target" tabindex="0" role="button" aria-label="${hourLabel(h)}–${hourLabel((h+1)%24)}: ${number(v)} crashes" data-value="${number(v)}" data-context="${hourLabel(h)}–${hourLabel((h+1)%24)}" x="${x}" y="${y(v)}" width="${step-8}" height="${Math.max(3,v/ceiling*plotH)}" rx="3" fill="${v===peak?'var(--primary)':'#8aaedc'}"><title>${hourLabel(h)}–${hourLabel((h+1)%24)}: ${number(v)} crashes</title></rect><text x="${x+(step-8)/2}" y="${height-14}" text-anchor="middle" style="font-size:13px">${hourLabel(h)}</text>`;});
  document.querySelector('#hourly').innerHTML=svg+'</svg>';
  bindChartValues(document.querySelector('#hourly'));
  document.querySelector('#hour-table').innerHTML=table(['Local hour','Crashes'],counts.map((v,h)=>[`${hourLabel(h)}–${hourLabel((h+1)%24)}`,number(v)]));
}

// One floating label keeps values legible outside the scrollable SVG viewport.
let valueTip;
function bindChartValues(container){
 if(!valueTip){
  valueTip=document.createElement('div');valueTip.id='chart-value-tooltip';valueTip.className='chart-value-tooltip';valueTip.role='tooltip';valueTip.hidden=true;document.body.append(valueTip);
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.chart-value-target'))valueTip.hidden=true;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')valueTip.hidden=true;});
  window.addEventListener('scroll',()=>{if(!valueTip.hidden)valueTip.reposition?.();},true);
  window.addEventListener('resize',()=>valueTip.hidden=true);
 }
 valueTip.hidden=true;
 container.querySelectorAll('.chart-value-target').forEach(el=>{
  el.setAttribute('aria-describedby','chart-value-tooltip');
  const show=()=>{
   valueTip.innerHTML=`<strong>${esc(el.dataset.value)} <span>crashes</span></strong><small>${esc(el.dataset.context)}</small>`;
   valueTip.reposition=show;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight||r.right<0||r.left>innerWidth){valueTip.hidden=true;return;}valueTip.hidden=false;const t=valueTip.getBoundingClientRect();
   valueTip.style.left=`${Math.max(8,Math.min(innerWidth-t.width-8,r.left+r.width/2-t.width/2))}px`;
   valueTip.style.top=`${Math.max(8,r.top-t.height-10)}px`;
  };
  el.addEventListener('pointerenter',show);el.addEventListener('focus',show);el.addEventListener('click',show);
  el.addEventListener('pointerleave',()=>{valueTip.hidden=true;});el.addEventListener('blur',()=>{valueTip.hidden=true;});
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show();}});
 });
}
