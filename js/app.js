import {parseCSV,cleanData,filterRows,summarize,groupBy,number,percent,escapeHTML as esc,prettyDate,UNKNOWN} from './data.js';
import {renderTrend,renderIntersections,renderHourly,intersectionGroups,hourLabel} from './charts.js';
import {createNeighborhoodMap} from './map.js';
const $=selector=>document.querySelector(selector);
let rows=[],extent={},quality={},selected=[];
let metric='total',mapMetric='total';
const neighborhoodMap=createNeighborhoodMap(name=>{$('#neighborhood').value=name;update();},value=>{mapMetric=value;saveState(currentState());});
const controls=['year','start','end','neighborhood','mode','injury','hospital'];
function currentState(){return {start:$('#start').value,end:$('#end').value,neighborhood:$('#neighborhood').value,mode:$('#mode').value,injury:$('#injury').checked,hospital:$('#hospital').checked};}
function saveState(state){
  const url=new URL(location.href);url.search='';
  for(const [key,value] of Object.entries(state))if(value&&value!=='all')url.searchParams.set(key,String(value));
  url.searchParams.set('metric',metric);url.searchParams.set('map',mapMetric);
  history.replaceState(null,'',url);
}
function restoreState(){
  const params=new URLSearchParams(location.search);
  for(const key of ['neighborhood','mode']){const el=$(`#${key}`),v=params.get(key);if([...el.options].some(o=>o.value===v))el.value=v;}
  for(const key of ['start','end']){const v=params.get(key);if(v&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&v>=extent.min&&v<=extent.max)$(`#${key}`).value=v;}
  for(const key of ['injury','hospital'])$(`#${key}`).checked=params.get(key)==='true';
  if(['total','injuries','vulnerable'].includes(params.get('metric')))metric=params.get('metric');
  if(['total','injuries','vulnerable','hospitalizations'].includes(params.get('map')))mapMetric=params.get('map');
  syncYear();syncRanking();
}
function syncYear(){
  const {start,end}=currentState();
  $('#year').value=start===extent.min&&end===extent.max?'all':start.slice(0,4)===end.slice(0,4)&&start===([`${start.slice(0,4)}-01-01`,extent.min].sort().at(-1))&&end===(`${start.slice(0,4)}-12-31`>extent.max?extent.max:`${start.slice(0,4)}-12-31`)?start.slice(0,4):'custom';
}
function syncRanking(){document.querySelectorAll('[data-metric]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.metric===metric)));}
function renderInsights(data){
  if(!data.length){$('#finding-content').innerHTML='<p class="empty">No matching records. Broaden your selection to generate findings.</p>';$('#recommendation-content').innerHTML='<p>No evidence-based priority can be proposed for an empty selection. Reset filters or expand the date range.</p>';return;}
  const s=summarize(data),intersections=intersectionGroups(data).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));
  const top=intersections[0],hours=[...groupBy(data,'hour')].map(([hour,list])=>({hour,count:list.length})).sort((a,b)=>b.count-a.count||a.hour-b.hour);
  const peaks=hours.filter(h=>h.count===hours[0].count),hourNames=peaks.map(h=>`${hourLabel(h.hour)}–${hourLabel((h.hour+1)%24)}`).join(', ');
  const topTies=top?intersections.filter(i=>i.total===top.total):[];
  const finding=(id,title,text)=>`<div id="${id}" class="finding"><span class="finding-marker" aria-hidden="true">↗</span><div><h4>${title}</h4><p>${text}</p></div></div>`;
  $('#finding-content').innerHTML=(top?finding('finding-location',`${esc(top.name)}`,`${number(top.total)} reported crashes${topTies.length>1?` — tied for the largest named-intersection count with ${number(topTies.length-1)} other intersection${topTies.length>2?'s':''}`:' — the largest count among recorded street pairs'}. This is ${percent(top.total,data.length)} of all selected crashes; incomplete intersection records are excluded from this ranking.`):finding('finding-location','Intersection detail is unavailable','No selected records have both intersection street names. Location priorities cannot be identified from this selection.'))+
    finding('finding-mode','People walking and cycling',`${number(s.vulnerable)} selected crashes (${percent(s.vulnerable,s.total)}) involved a pedestrian or cyclist. Across all modes, ${number(s.injuries)} crashes (${percent(s.injuries,s.total)}) involved a recorded injury.`)+
    finding('finding-hour',peaks.length===1?`${hourNames} has the most records`:'Several hours share the highest count',`${peaks.length===1?'This hour':`${hourNames}`} ${peaks.length===1?'accounts':'each account'} for ${number(hours[0].count)} crashes (${percent(hours[0].count,s.total)}${peaks.length>1?' each':''}). These counts do not account for trips made in each hour.`);
  const rec=(title,text,link)=>`<div class="recommendation"><h4>${title}</h4><p>${text}</p><a href="#${link}">View supporting finding ↑</a></div>`;
  $('#recommendation-content').innerHTML=(top?rec('Prioritize a location review',`${esc(top.name)} has ${number(top.total)} selected crashes${topTies.length>1?' and shares the top count':''}. Validate the street-pair grouping, then review crash reports and observe turning movements, visibility, and crossing conditions before selecting an intervention.`,'finding-location'):rec('Resolve location gaps first','The selection has no complete intersection pairs. Review source location records before choosing sites for a field assessment.','finding-location'))+
    (s.vulnerable?rec('Examine walking and cycling conditions',`The ${number(s.vulnerable)} pedestrian / cyclist-involved crashes warrant a closer review of conflict patterns and crossing or bicycle-facility continuity. Add walking and cycling volume data to assess exposure before comparing risk.`,'finding-mode'):rec('Check road-user coverage','No selected crashes record pedestrian or cyclist involvement. Confirm whether active mode filters or missing involvement fields explain this result before drawing conclusions about these groups.','finding-mode'))+
    rec('Match observations to reported timing',`Use ${hourNames} as ${peaks.length===1?'a candidate period':'candidate periods'} for field observations: ${number(hours[0].count)} selected crashes occurred in ${peaks.length===1?'this hour':'each'}. Compare traffic volumes and conditions across other hours before attributing causes.`,'finding-hour');
}
function update(){
  const state=currentState();
  const invalid=!state.start||!state.end||state.start>state.end||state.start<extent.min||state.end>extent.max;
  $('#date-error').hidden=!invalid;
  for(const k of ['start','end'])$(`#${k}`).setAttribute('aria-invalid',String(invalid));
  if(invalid){$('#date-error').textContent=`Choose a start date on or before the end date, within ${prettyDate(extent.min)}–${prettyDate(extent.max)}. The last valid results remain displayed.`;return;}
  selected=filterRows(rows,state);const stats=summarize(selected);
  for(const [key,value] of Object.entries(stats))$(`#kpi-${key}`).textContent=number(value);
  $('#injury-share').textContent=`${percent(stats.injuries,stats.total)} of selected crashes · not people`;
  $('#vulnerable-share').textContent=`${percent(stats.vulnerable,stats.total)} of selected crashes · counted once`;
  $('#selection-count').textContent=`${number(selected.length)} of ${number(rows.length)} records`;
  $('#scope').textContent=`${prettyDate(state.start)} – ${prettyDate(state.end)} · ${state.neighborhood||'All neighborhoods'} · ${$('#mode').selectedOptions[0].text}${state.injury?' · Injury crashes':''}${state.hospital?' · Hospitalization only':''} · ${number(selected.length)} crashes`;
  $('#partial-warning').hidden=!(state.end>='2026-01-01'&&state.start<='2026-12-31');
  renderTrend(selected,state,extent);renderIntersections(selected,metric);renderHourly(selected);neighborhoodMap.update(selected,state,mapMetric);renderInsights(selected);saveState(state);
}
async function load(){
  $('#load-status').hidden=false;$('#load-status').classList.remove('error');$('#load-status').textContent='Loading and validating the local crash log…';$('#filter-fields').disabled=true;
  try{
    const response=await fetch('data/cambridge_crashes.csv',{signal:AbortSignal.timeout(20000)});
    if(!response.ok)throw new Error(`The CSV request returned ${response.status}.`);
    ({rows,quality}=cleanData(parseCSV(await response.text())));
    const dates=rows.map(r=>r.iso).sort();extent={min:dates[0],max:dates.at(-1)};
    const years=[...new Set(rows.map(r=>r.year))].sort((a,b)=>a-b);
    $('#coverage').textContent=`${prettyDate(extent.min)} – ${prettyDate(extent.max)}`;
    $('#year').innerHTML='<option value="all">All years</option>'+years.map(y=>`<option value="${y}">${y}${y===2026?' (partial)':''}</option>`).join('')+'<option value="custom">Custom dates</option>';
    $('#neighborhood').innerHTML='<option value="">All neighborhoods</option>'+[...new Set(rows.map(r=>r.neighborhood))].sort((a,b)=>a===UNKNOWN?1:b===UNKNOWN?-1:a.localeCompare(b)).map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
    for(const key of ['start','end']){$(`#${key}`).min=extent.min;$(`#${key}`).max=extent.max;$(`#${key}`).value=key==='start'?extent.min:extent.max;}
    $('#partial-copy').textContent=`The supplied dataset ends on ${prettyDate(extent.max)}.`;
    $('#quality-summary').textContent=`The file contains ${number(quality.sourceRows)} records; ${number(quality.invalidDates)} were excluded for invalid dates. Of the retained records, ${number(quality.missingNeighborhood)} have no neighborhood and ${number(quality.incompleteIntersections)} lack a complete intersection pair. There are ${number(quality.unknownNumeric)} unknown numeric fields and ${number(quality.exactDuplicates)} exact duplicate rows.`;
    const unknown=rows.filter(r=>!(r.motorist>0||r.cyclist>0||r.pedestrian>0)).length;
    $('#unknown-modes').textContent=`Across the entire supplied dataset, ${number(unknown)} records have no positive recorded count for any of the three road-user modes. These records are included in the all-mode total but not in the three involvement series.`;
    restoreState();$('#filter-fields').disabled=false;$('#load-status').hidden=true;update();
  }catch(error){$('#load-status').classList.add('error');$('#load-status').innerHTML=`<strong>The crash data could not be loaded.</strong> ${esc(error.message)} Serve this project with a local web server and confirm the CSV is in the data folder. <button id="retry" type="button">Try again</button>`;$('#retry').addEventListener('click',load);}
}
$('#filters').addEventListener('submit',e=>e.preventDefault());
controls.forEach(id=>$(`#${id}`).addEventListener('change',()=>{
  if(id==='year'&&$('#year').value!=='custom'){
    const year=$('#year').value;$('#start').value=year==='all'?extent.min:[`${year}-01-01`,extent.min].sort().at(-1);$('#end').value=year==='all'?extent.max:[`${year}-12-31`,extent.max].sort()[0];
  }else if(id==='start'||id==='end')syncYear();
  update();
}));
$('#filters').addEventListener('reset',event=>{event.preventDefault();$('#year').value='all';$('#start').value=extent.min;$('#end').value=extent.max;$('#neighborhood').value='';$('#mode').value='all';$('#injury').checked=false;$('#hospital').checked=false;update();});
document.querySelectorAll('[data-metric]').forEach(b=>b.addEventListener('click',()=>{metric=b.dataset.metric;syncRanking();renderIntersections(selected,metric);saveState(currentState());}));
neighborhoodMap.load();
load();
