const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const UNKNOWN = 'Unknown / not recorded';
export const FIELDS = {
  motorist: 'Number of Motorists', cyclist: 'Number of Cyclists', pedestrian: 'Number of Pedestrians',
  injured: 'Number of Injured Individuals', hospital: 'Hospitalizations (estimated)'
};

// A small RFC 4180-style parser: quoted commas/newlines and doubled quotes are preserved.
export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const records=[]; let record=[], field='', quoted=false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (c==='"') {
      if (quoted && text[i+1]==='"') { field+='"'; i++; }
      else quoted=!quoted;
    } else if (c===',' && !quoted) { record.push(field); field=''; }
    else if ((c==='\n'||c==='\r') && !quoted) {
      if(c==='\r' && text[i+1]==='\n') i++;
      record.push(field); if(record.some(v=>v.trim())) records.push(record);
      record=[]; field='';
    } else field+=c;
  }
  if(quoted) throw new Error('The CSV contains an unclosed quoted field.');
  record.push(field); if(record.some(v=>v.trim())) records.push(record);
  if(!records.length) throw new Error('The CSV is empty.');
  const headers=records.shift().map(h=>h.trim());
  if(new Set(headers).size!==headers.length) throw new Error('The CSV has duplicate column names.');
  return records.map((values,index)=> {
    if(values.length!==headers.length) throw new Error(`CSV row ${index+2} has an unexpected number of fields.`);
    return Object.fromEntries(headers.map((h,i)=>[h,values[i].trim()]));
  });
}

// Interpret the source as Cambridge wall-clock time, not the viewer's timezone.
export function parseDate(value) {
  const m=value.match(/^(\d{4}) ([A-Za-z]{3}) (\d{1,2}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)$/);
  if(!m) return null;
  const year=+m[1], month=MONTHS.indexOf(m[2]), day=+m[3], h=+m[4];
  if(month<0 || h<1 || h>12 || +m[5]>59 || +m[6]>59) return null;
  const date=new Date(Date.UTC(year,month,day));
  if(date.getUTCMonth()!==month || date.getUTCDate()!==day) return null;
  return {year, iso:`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`, hour:h%12+(m[7]==='PM'?12:0), weekday:date.getUTCDay()};
}
// Street-type abbreviations, expanded on every word EXCEPT the first, so that
// "SIDNEY ST EXT" becomes "Sidney Street Extension" while "ST MARY RD" keeps its
// leading "St" instead of turning into "Street Mary Road".
const STREET_TYPES={ST:'STREET',STEET:'STREET',AVE:'AVENUE',AV:'AVENUE',RD:'ROAD',BLVD:'BOULEVARD',
  DR:'DRIVE',PL:'PLACE',CT:'COURT',PKWY:'PARKWAY',HWY:'HIGHWAY',TER:'TERRACE',SQ:'SQUARE',LN:'LANE',
  CIR:'CIRCLE',EXT:'EXTENSION'};
// Whole-name synonyms. This is an explicit, auditable list, not fuzzy matching:
// every entry was checked against City of Cambridge records, and near-matches we
// could not verify (e.g. "SAINT MARY'S STREET") are deliberately left unmerged.
const SYNONYMS=[
  [/^MASS(ACHUSETTS)?( (AVENUE|AVENU|AVEUNUE|AVENBUE|AVVE|VENUE))?$/,'MASSACHUSETTS AVENUE'],
  [/^(MON?S|MSGR?|MSG|MNSR|O'?BRIEN|OBRIEN).*BRIEN/,"MONSIGNOR O'BRIEN HIGHWAY"],
  [/^(ST|SAINT) MARY('S)?( ROAD)?$/,'ST MARY ROAD']
];
export function normalizeStreet(value) {
  let text=value.trim().toUpperCase().replace(/\./g,'').replace(/\s+/g,' ').replace(/^\d+ /,'');
  text=text.split(' ').map((w,i)=>i?STREET_TYPES[w]||w:w).join(' ');
  for(const [pattern,canonical] of SYNONYMS) if(pattern.test(text)) {text=canonical;break;}
  // Title-case: capitalise each word, and after an apostrophe only when a name
  // follows ("O'Brien"), never a possessive ("Mary's").
  return text.toLowerCase().replace(/(^|[\s-])(\w)/g,(m,lead,c)=>lead+c.toUpperCase())
    .replace(/'(\w{2,})/g,(m,w)=>`'${w[0].toUpperCase()}${w.slice(1)}`);
}
export function cleanData(raw) {
  const required=['Date Time','Intersection Street One','Intersection Street Two','Neighborhood (estimated)',...Object.values(FIELDS)];
  if(!raw.length || required.some(k=>!(k in raw[0]))) throw new Error('The CSV is missing required CPD Crash Log columns.');
  const quality={sourceRows:raw.length,invalidDates:0,missingNeighborhood:0,unknownNumeric:0,incompleteIntersections:0,exactDuplicates:0};
  const seen=new Set(); const rows=[];
  for(const source of raw) {
    const key=JSON.stringify(source); if(seen.has(key)) quality.exactDuplicates++; seen.add(key);
    const date=parseDate(source['Date Time']);
    if(!date) {quality.invalidDates++;continue;}
    const row={...date,neighborhood:source['Neighborhood (estimated)'].trim()||UNKNOWN};
    if(row.neighborhood===UNKNOWN) quality.missingNeighborhood++;
    for(const [key,field] of Object.entries(FIELDS)) {
      const value=source[field].trim();
      row[key]=/^\d+$/.test(value)?Number(value):null;
      if(row[key]===null) quality.unknownNumeric++;
    }
    const streets=[normalizeStreet(source['Intersection Street One']),normalizeStreet(source['Intersection Street Two'])];
    row.intersection=streets.every(Boolean)?streets.sort().join(' & '):null;
    if(!row.intersection) quality.incompleteIntersections++;
    rows.push(row);
  }
  if(!rows.length) throw new Error('No records have a valid date.');
  return {rows,quality};
}
export function filterRows(rows,state={}) {
  return rows.filter(r=>(!state.start||r.iso>=state.start)&&(!state.end||r.iso<=state.end)&&
    (!state.neighborhood||r.neighborhood===state.neighborhood)&&
    (!state.mode||state.mode==='all'||r[state.mode]>0)&&(!state.injury||r.injured>0)&&(!state.hospital||r.hospital>0));
}
export function summarize(rows) {
  return rows.reduce((a,r)=>({total:a.total+1,injuries:a.injuries+(r.injured>0),vulnerable:a.vulnerable+(r.cyclist>0||r.pedestrian>0),hospitalizations:a.hospitalizations+(r.hospital??0)}),{total:0,injuries:0,vulnerable:0,hospitalizations:0});
}
export function groupBy(rows,key) {
  const groups=new Map();
  for(const r of rows) {const value=r[key];if(!groups.has(value))groups.set(value,[]);groups.get(value).push(r);}
  return groups;
}
export const number=n=>new Intl.NumberFormat('en-US').format(n);
export const percent=(n,total)=>total?`${(100*n/total).toFixed(1)}%`:'—';
export const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const prettyDate=iso=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${iso}T00:00:00Z`));
