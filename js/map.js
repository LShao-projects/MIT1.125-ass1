import {groupBy,summarize,number,percent,escapeHTML as esc} from './data.js';
export const MAP_METRICS={total:'Total crashes',injuries:'Injury crashes',vulnerable:'Walk / bike crashes',hospitalizations:'Estimated hospitalizations'};
const COLORS=['#deebfa','#aacbec','#729fda','#3b74b7','#173f7a'];
export function aggregateMap(rows,features){
 const groups=groupBy(rows,'neighborhood'),names=new Set(features.map(f=>f.properties.NAME));
 return {areas:features.map(f=>({name:f.properties.NAME,id:f.properties.N_HOOD,...summarize(groups.get(f.properties.NAME)||[])})),unmapped:summarize(rows.filter(r=>!names.has(r.neighborhood)))};
}
// Shared Web Mercator coordinates keep boundaries aligned with street tiles.
const TILE_ZOOM=13, WORLD=256*2**TILE_ZOOM;
const mercator=([lon,lat])=>[(lon+180)/360*WORLD,(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*WORLD];
const mapCenter=mercator([-71.108,42.373]);
const origin=[mapCenter[0]-420,mapCenter[1]-300];
const project=p=>{const xy=mercator(p);return [xy[0]-origin[0],xy[1]-origin[1]];};
function basemap(zoom,center){
 const tx=zoom===1?0:420-zoom*center[0],ty=zoom===1?0:300-zoom*center[1];
 const left=origin[0]-tx/zoom,top=origin[1]-ty/zoom;
 let tiles='';
 for(let x=Math.floor(left/256);x<=Math.floor((left+840/zoom)/256);x++)
  for(let y=Math.floor(top/256);y<=Math.floor((top+600/zoom)/256);y++)
   tiles+=`<image x="${x*256-origin[0]}" y="${y*256-origin[1]}" width="256" height="256" href="https://tile.openstreetmap.org/${TILE_ZOOM}/${x}/${y}.png"/>`;
 return tiles;
}
export function projectBoundaries(geo){
 const polygons=f=>f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
 return geo.features.map(f=>{
  const rings=polygons(f).flat().map(r=>r.map(project));
  let area=0,cx=0,cy=0;const ring=rings[0];
  for(let i=0;i<ring.length-1;i++){const [x,y]=ring[i],[nx,ny]=ring[i+1],a=x*ny-nx*y;area+=a;cx+=(x+nx)*a;cy+=(y+ny)*a;}
  return {name:f.properties.NAME,id:f.properties.N_HOOD,path:rings.map(r=>r.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ')+'Z').join(' '),center:[cx/(3*area),cy/(3*area)]};
 });
}
export function createNeighborhoodMap(onFilter,onMetric){
 let geo=null,geometry=[],selectedName='',metric='total',currentRows=[],areaRows=[],state={},zoom=1,error=false;
 const $=s=>document.querySelector(s);
 function details(){
  const {areas}=aggregateMap(areaRows,geo.features);
  const combined=areas.reduce((a,x)=>({name:'All neighborhoods',id:`${areas.length} areas`,
    total:a.total+x.total,injuries:a.injuries+x.injuries,vulnerable:a.vulnerable+x.vulnerable,
    hospitalizations:a.hospitalizations+x.hospitalizations}),
    {name:'All neighborhoods',id:`${areas.length} areas`,total:0,injuries:0,vulnerable:0,hospitalizations:0});
  const showingAll=selectedName==='__all__';
  const area=showingAll?combined:areas.find(a=>a.name===selectedName);
  if(!area)return;
  $('#map-inspect').value=selectedName;
  $('#map-detail').innerHTML=`<p class="eyebrow">NEIGHBORHOOD ${esc(area.id)}</p><h4>${esc(area.name)}</h4><div class="map-main-stat"><strong>${number(area[metric])}</strong><span>${MAP_METRICS[metric].toLowerCase()}</span></div><dl class="map-stats"><div><dt>Total crashes</dt><dd>${number(area.total)}</dd></div><div><dt>Injury crashes</dt><dd>${number(area.injuries)}</dd></div><div><dt>Walk / bike crashes</dt><dd>${number(area.vulnerable)}</dd></div><div><dt>Est. hospitalizations</dt><dd>${number(area.hospitalizations)}</dd></div><div><dt>Injury share</dt><dd>${percent(area.injuries,area.total)}</dd></div></dl><p class="map-detail-note">${showingAll?'All 13 official neighborhoods combined. Select an area on the map to filter the whole dashboard to it.':!area.total?'No matching crash records for this area under your current date and road-user filters.':`The whole dashboard is filtered to ${esc(area.name)}. Other areas stay on the map, faded, so you can still compare them. Injury share is not an exposure-adjusted risk rate.`}</p>`;
  $('#map-filter').textContent=showingAll?'Select an area on the map':'Show all neighborhoods';
  $('#map-filter').disabled=showingAll;
  const highlight=showingAll?null:area.name;
  document.querySelectorAll('.map-region').forEach(p=>p.setAttribute('aria-pressed',String(p.dataset.name===highlight)));
  document.querySelectorAll('.map-marker').forEach(p=>p.classList.toggle('is-selected',p.dataset.name===highlight));
 }
 function transform(){
  const group=$('#map-geography');if(!group)return;
  const c=selectedName==='__all__'?[420,300]:(geometry.find(g=>g.name===selectedName)?.center||[420,300]);
  const x=zoom===1?0:420-zoom*c[0],y=zoom===1?0:300-zoom*c[1];
  group.setAttribute('transform',`translate(${x} ${y}) scale(${zoom})`);
  const base=$('#map-basemap');base.setAttribute('transform',`translate(${x} ${y}) scale(${zoom})`);base.innerHTML=basemap(zoom,c);
  base.querySelectorAll('image').forEach(img=>img.addEventListener('error',()=>{$('#basemap-note').hidden=false;}));
  $('#map-zoom-out').disabled=zoom<=1;$('#map-zoom-in').disabled=zoom>=2.5;
 }
 // Choosing an area IS the filter: the map is the control, not a preview.
 function select(name){onFilter(name==='__all__'?'':name);}
 function render(){
  if(!geo)return;
  const {areas,unmapped}=aggregateMap(areaRows,geo.features),max=Math.max(...areas.map(a=>a[metric]),0);
  selectedName=state.neighborhood&&areas.some(a=>a.name===state.neighborhood)?state.neighborhood:'__all__';
  const bin=v=>Math.min(4,Math.max(0,Math.ceil(v/Math.max(1,max)*5)-1));
  const byName=new Map(areas.map(a=>[a.name,a]));
  $('#map-graphic').innerHTML=`<svg viewBox="0 0 840 600" role="group" aria-label="Cambridge neighborhoods with surrounding Boston area streets"><defs><pattern id="map-excluded" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#eef2f8"/><path d="M0 8L8 0" stroke="#cbd6e6" stroke-width="1"/></pattern></defs><g id="map-basemap" aria-hidden="true"></g><g id="map-geography">${geometry.map(g=>{const a=byName.get(g.name),filtered=state.neighborhood===g.name,dimmed=state.neighborhood&&!filtered;return `<path class="map-region${filtered?' is-filtered':''}${dimmed?' is-dimmed':''}" data-name="${esc(g.name)}" data-count="${a[metric]}" d="${g.path}" fill="${a[metric]===0?'#f3f6fb':COLORS[bin(a[metric])]}" fill-rule="evenodd" role="button" tabindex="0" aria-pressed="${g.name===selectedName}" aria-label="${esc(g.name)}: ${number(a[metric])} ${MAP_METRICS[metric].toLowerCase()}${filtered?', the active dashboard filter':''}. ${filtered?'Show all neighborhoods':'Filter the dashboard to this neighborhood'}"><title>${esc(g.name)} · ${number(a[metric])} ${MAP_METRICS[metric].toLowerCase()}</title></path>`;}).join('')}${geometry.map(g=>`<g class="map-marker${state.neighborhood&&state.neighborhood!==g.name?' is-dimmed':''}" data-name="${esc(g.name)}" transform="translate(${g.center[0]} ${g.center[1]})" aria-hidden="true"><circle r="15"/><text text-anchor="middle" dy="5">${esc(g.id)}</text></g>`).join('')}</g></svg>`;
  document.querySelectorAll('.map-region').forEach(path=>{
   const toggle=()=>select(state.neighborhood===path.dataset.name?'__all__':path.dataset.name);
   path.addEventListener('click',toggle);
   path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}});
  });
  $('#map-legend').innerHTML=`<span class="map-legend-title">${MAP_METRICS[metric]} · selected records</span><div class="map-color-ramp">${COLORS.map(c=>`<i style="background:${c}"></i>`).join('')}</div><div class="map-scale-values"><span>Fewer</span><span>${number(max)} maximum</span></div><p>White = zero matching records${state.neighborhood?` \u00b7 Outlined = ${esc(state.neighborhood)}, the active dashboard filter`:''}. Every area is shown for comparison; colors rescale with your date and road-user filters.</p>`;
  const selectedStats=aggregateMap(currentRows,geo.features);
  const selectedMapped=selectedStats.areas.reduce((s,a)=>s+a.total,0);
  $('#map-coverage').textContent=state.neighborhood
   ?`Dashboard filtered to ${state.neighborhood}: ${number(selectedMapped)} crashes. All 13 areas stay on the map for comparison.`
   :`${number(selectedMapped)} crashes mapped to named neighborhoods · ${number(unmapped.total)} without a mapped neighborhood.`;
  $('#map-unmapped').innerHTML=`<strong>${number(selectedStats.unmapped.total)}</strong><span>selected crashes cannot be placed on this map. These records remain in the dashboard totals.</span>`;
  $('#map-empty').hidden=areaRows.length!==0;
  details();transform();
 }
 async function load(){
  $('#map-status').hidden=false;$('#map-status').textContent='Loading official neighborhood boundaries…';
  try{const response=await fetch('data/cambridge_neighborhoods.geojson',{signal:AbortSignal.timeout(20000)});if(!response.ok)throw new Error('Map boundary file unavailable.');geo=await response.json();if(!geo.features?.length||geo.features.some(f=>!f.properties?.NAME||!['Polygon','MultiPolygon'].includes(f.geometry?.type)))throw new Error('Invalid neighborhood boundary file.');geometry=projectBoundaries(geo);$('#map-inspect').innerHTML='<option value="__all__">All neighborhoods</option>'+geometry.slice().sort((a,b)=>+a.id-+b.id).map(g=>`<option value="${esc(g.name)}">${esc(g.id)} · ${esc(g.name)}</option>`).join('');$('#map-status').hidden=true;$('#map-content').hidden=false;error=false;render();}
  catch(e){error=true;$('#map-content').hidden=true;$('#map-status').innerHTML=`The neighborhood map could not load. Your other charts still work. <button id="map-retry" type="button">Retry map</button>`;$('#map-retry').addEventListener('click',load);}
 }
 $('#map-measure').addEventListener('change',()=>{metric=$('#map-measure').value;render();onMetric(metric);});
 $('#map-inspect').addEventListener('change',()=>select($('#map-inspect').value));
 $('#map-filter').addEventListener('click',()=>select('__all__'));
 $('#map-clear-filter').addEventListener('click',()=>select('__all__'));
 $('#map-zoom-in').addEventListener('click',()=>{zoom=Math.min(2.5,zoom+.5);transform();});
 $('#map-zoom-out').addEventListener('click',()=>{zoom=Math.max(1,zoom-.5);transform();});
 $('#map-fit').addEventListener('click',()=>{zoom=1;transform();});
 return {load,update(data,filters,mapMetric,comparisonRows){currentRows=data;areaRows=comparisonRows||data;state=filters;if(mapMetric in MAP_METRICS)metric=mapMetric;$('#map-measure').value=metric;$('#map-clear-filter').hidden=!filters.neighborhood;render();},get failed(){return error;}};
}
