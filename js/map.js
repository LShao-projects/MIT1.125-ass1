import {groupBy,summarize,number,percent,escapeHTML as esc} from './data.js';
export const MAP_METRICS={total:'Total crashes',injuries:'Injury crashes',vulnerable:'Walk / bike crashes',hospitalizations:'Estimated hospitalizations'};
const COLORS=['#daebe4','#adcfc1','#72a994','#388069','#124d50'];
export function aggregateMap(rows,features){
 const groups=groupBy(rows,'neighborhood'),names=new Set(features.map(f=>f.properties.NAME));
 return {areas:features.map(f=>({name:f.properties.NAME,id:f.properties.N_HOOD,...summarize(groups.get(f.properties.NAME)||[])})),unmapped:summarize(rows.filter(r=>!names.has(r.neighborhood)))};
}
export function projectBoundaries(geo){
 const polygons=f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
 const points=geo.features.flatMap(f=>polygons(f).flat(2));
 const cos=Math.cos(42.37*Math.PI/180),xs=points.map(p=>p[0]*cos),ys=points.map(p=>-p[1]);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
 const scale=Math.min(760/(maxX-minX),520/(maxY-minY));
 const ox=(840-(maxX-minX)*scale)/2,oy=(600-(maxY-minY)*scale)/2;
 const project=p=>[ox+(p[0]*cos-minX)*scale,oy+(-p[1]-minY)*scale];
 return geo.features.map(f=>{
  const rings=polygons(f).flat().map(r=>r.map(project));
  let area=0,cx=0,cy=0;const ring=rings[0];
  for(let i=0;i<ring.length-1;i++){const [x,y]=ring[i],[nx,ny]=ring[i+1],a=x*ny-nx*y;area+=a;cx+=(x+nx)*a;cy+=(y+ny)*a;}
  return {name:f.properties.NAME,id:f.properties.N_HOOD,path:rings.map(r=>r.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')+'Z').join(' '),center:[cx/(3*area),cy/(3*area)]};
 });
}
export function createNeighborhoodMap(onFilter,onMetric){
 let geo=null,geometry=[],selectedName='',metric='total',currentRows=[],state={},zoom=1,error=false;
 const $=s=>document.querySelector(s);
 function details(){
  const {areas}=aggregateMap(currentRows,geo.features),area=areas.find(a=>a.name===selectedName);
  if(!area)return;
  $('#map-inspect').value=selectedName;
  $('#map-detail').innerHTML=`<p class="eyebrow">NEIGHBORHOOD ${esc(area.id)}</p><h4>${esc(area.name)}</h4><div class="map-main-stat"><strong>${number(area[metric])}</strong><span>${MAP_METRICS[metric].toLowerCase()}</span></div><dl class="map-stats"><div><dt>Total crashes</dt><dd>${number(area.total)}</dd></div><div><dt>Injury crashes</dt><dd>${number(area.injuries)}</dd></div><div><dt>Walk / bike crashes</dt><dd>${number(area.vulnerable)}</dd></div><div><dt>Est. hospitalizations</dt><dd>${number(area.hospitalizations)}</dd></div><div><dt>Injury share</dt><dd>${percent(area.injuries,area.total)}</dd></div></dl><p class="map-detail-note">${state.neighborhood&&state.neighborhood!==area.name?'This area is outside the active neighborhood filter. Clear that filter to compare all areas.':area.total?'Counts reflect your current global filters. Injury share is not an exposure-adjusted risk rate.':'No matching crash records for this area in the current selection.'}</p>`;
  $('#map-filter').textContent=state.neighborhood===area.name?'Show all neighborhoods':`Filter to this neighborhood`;
  document.querySelectorAll('.map-region').forEach(p=>p.setAttribute('aria-pressed',String(p.dataset.name===area.name)));
  document.querySelectorAll('.map-marker').forEach(p=>p.classList.toggle('is-selected',p.dataset.name===area.name));
 }
 function transform(){
  const group=$('#map-geography');if(!group)return;
  const c=geometry.find(g=>g.name===selectedName)?.center||[420,300];
  const x=zoom===1?0:420-zoom*c[0],y=zoom===1?0:300-zoom*c[1];
  group.setAttribute('transform',`translate(${x} ${y}) scale(${zoom})`);
  $('#map-zoom-out').disabled=zoom<=1;$('#map-zoom-in').disabled=zoom>=2.5;
 }
 function select(name){selectedName=name;details();transform();}
 function render(){
  if(!geo)return;
  const {areas,unmapped}=aggregateMap(currentRows,geo.features),max=Math.max(...areas.map(a=>a[metric]),0);
  if(state.neighborhood&&areas.some(a=>a.name===state.neighborhood))selectedName=state.neighborhood;
  if(!selectedName)selectedName=[...areas].sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name))[0].name;
  const bin=v=>Math.min(4,Math.max(0,Math.ceil(v/Math.max(1,max)*5)-1));
  const byName=new Map(areas.map(a=>[a.name,a]));
  $('#map-graphic').innerHTML=`<svg viewBox="0 0 840 600" role="group" aria-label="Cambridge neighborhood comparison map"><defs><pattern id="map-excluded" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#eef2f0"/><path d="M0 8L8 0" stroke="#cad6d0" stroke-width="1"/></pattern></defs><g id="map-geography">${geometry.map(g=>{const a=byName.get(g.name),excluded=state.neighborhood&&state.neighborhood!==g.name;return `<path class="map-region" data-name="${esc(g.name)}" data-count="${a[metric]}" d="${g.path}" fill="${excluded?'url(#map-excluded)':a[metric]===0?'#f3f6f4':COLORS[bin(a[metric])]}" fill-rule="evenodd" role="button" tabindex="0" aria-pressed="${g.name===selectedName}" aria-label="${esc(g.name)}: ${number(a[metric])} ${MAP_METRICS[metric].toLowerCase()}${excluded?', outside active neighborhood filter':''}. Inspect neighborhood"><title>${esc(g.name)} · ${number(a[metric])} ${MAP_METRICS[metric].toLowerCase()}</title></path>`;}).join('')}${geometry.map(g=>`<g class="map-marker" data-name="${esc(g.name)}" transform="translate(${g.center[0]} ${g.center[1]})" aria-hidden="true"><circle r="15"/><text text-anchor="middle" dy="5">${esc(g.id)}</text></g>`).join('')}</g></svg>`;
  document.querySelectorAll('.map-region').forEach(path=>{
   path.addEventListener('click',()=>select(path.dataset.name));
   path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(path.dataset.name);}});
  });
  $('#map-legend').innerHTML=`<span class="map-legend-title">${MAP_METRICS[metric]} · selected records</span><div class="map-color-ramp">${COLORS.map(c=>`<i style="background:${c}"></i>`).join('')}</div><div class="map-scale-values"><span>Fewer</span><span>${number(max)} maximum</span></div><p>White = zero matching records${state.neighborhood?' · Hatched = outside neighborhood filter':''}. Colors rescale with your selection.</p>`;
  $('#map-coverage').textContent=`${number(areas.reduce((s,a)=>s+a.total,0))} crashes mapped to named neighborhoods · ${number(unmapped.total)} without a mapped neighborhood`;
  $('#map-unmapped').innerHTML=`<strong>${number(unmapped.total)}</strong><span>selected crashes cannot be placed on this map. These records remain in the dashboard totals.</span>`;
  $('#map-empty').hidden=currentRows.length!==0;
  details();transform();
 }
 async function load(){
  $('#map-status').hidden=false;$('#map-status').textContent='Loading official neighborhood boundaries…';
  try{const response=await fetch('data/cambridge_neighborhoods.geojson',{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('Map boundary file unavailable.');geo=await response.json();if(!geo.features?.length||geo.features.some(f=>!f.properties?.NAME||!['Polygon','MultiPolygon'].includes(f.geometry?.type)))throw new Error('Invalid neighborhood boundary file.');geometry=projectBoundaries(geo);$('#map-inspect').innerHTML=geometry.slice().sort((a,b)=>+a.id-+b.id).map(g=>`<option value="${esc(g.name)}">${esc(g.id)} · ${esc(g.name)}</option>`).join('');$('#map-status').hidden=true;$('#map-content').hidden=false;error=false;render();}
  catch(e){error=true;$('#map-content').hidden=true;$('#map-status').innerHTML=`The neighborhood map could not load. Your other charts still work. <button id="map-retry" type="button">Retry map</button>`;$('#map-retry').addEventListener('click',load);}
 }
 $('#map-measure').addEventListener('change',()=>{metric=$('#map-measure').value;render();onMetric(metric);});
 $('#map-inspect').addEventListener('change',()=>select($('#map-inspect').value));
 $('#map-filter').addEventListener('click',()=>onFilter(state.neighborhood===selectedName?'':selectedName));
 $('#map-clear-filter').addEventListener('click',()=>onFilter(''));
 $('#map-zoom-in').addEventListener('click',()=>{zoom=Math.min(2.5,zoom+.5);transform();});
 $('#map-zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom-.5);transform();});
 $('#map-fit').addEventListener('click',()=>{zoom=1;transform();});
 return {load,update(data,filters,mapMetric){currentRows=data;state=filters;if(mapMetric in MAP_METRICS)metric=mapMetric;$('#map-measure').value=metric;$('#map-clear-filter').hidden=!filters.neighborhood;render();},get failed(){return error;}};
}
