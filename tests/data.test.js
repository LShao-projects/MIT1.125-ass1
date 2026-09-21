import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseCSV, cleanData, filterRows, summarize, normalizeStreet, parseDate, groupBy } from '../js/data.js';

test('CSV parser handles quoted commas, escaped quotes, CRLF, BOM and multiline fields', () => {
  assert.deepEqual(parseCSV('\uFEFFa,b\r\n"one,two","a""b"\r\n"line\nbreak",end\r\n'), [{a:'one,two',b:'a"b'},{a:'line\nbreak',b:'end'}]);
  assert.throws(() => parseCSV('a,b\n"unfinished,b'));
});
test('source timestamps preserve local calendar date and noon/midnight', () => {
  assert.equal(parseDate('2026 Sep 20 12:35:00 AM').hour, 0);
  assert.equal(parseDate('2026 Sep 20 12:35:00 PM').hour, 12);
  assert.equal(parseDate('2026 Sep 20 02:35:00 PM').iso, '2026-09-20');
  assert.equal(parseDate('2026 Feb 30 02:35:00 PM'), null);
});
test('normalization expands suffixes without guessing missing street types', () => {
  assert.equal(normalizeStreet('  Massachusetts   Ave. '), 'Massachusetts Avenue');
  assert.equal(normalizeStreet('BRATTLE'), 'Brattle');
});
const load = () => cleanData(parseCSV(readFileSync(new URL('../data/cambridge_crashes.csv', import.meta.url),'utf8')));
test('entire CSV agrees with independent Python audit', () => {
  const {rows, quality} = load();
  assert.deepEqual(summarize(rows), {total:15508, injuries:2261, vulnerable:2114, hospitalizations:2328});
  assert.equal(quality.invalidDates,0);
  assert.equal(quality.missingNeighborhood,3052);
  assert.equal(rows.filter(r=>r.intersection).length,5953);
  assert.equal(groupBy(rows,'year').get(2026).length,1176);
});
test('filters intersect, date bounds are inclusive, unknown neighborhoods remain selectable', () => {
  const {rows}=load();
  assert.equal(filterRows(rows,{start:'2026-01-01',end:'2026-12-31'}).length,1176);
  const subset=filterRows(rows,{start:'2026-01-01',end:'2026-09-20',mode:'cyclist',injury:true,hospital:true});
  assert.ok(subset.length>0);
  assert.ok(subset.every(r=>r.cyclist>0 && r.injured>0 && r.hospital>0));
  assert.equal(filterRows(rows,{neighborhood:'Unknown / not recorded'}).length,3052);
  assert.equal(filterRows(rows,{start:'2027-01-01',end:'2027-12-31'}).length,0);
  assert.deepEqual(summarize([]),{total:0,injuries:0,vulnerable:0,hospitalizations:0});
});
test('unknown numeric values stay unknown; reversed intersections group together', () => {
  const base=parseCSV(readFileSync(new URL('../data/cambridge_crashes.csv',import.meta.url),'utf8'))[0];
  const a={...base,'Intersection Street One':'MAIN ST.','Intersection Street Two':'ALBANY STREET','Number of Injured Individuals':''};
  const b={...a,'Intersection Street One':'Albany St','Intersection Street Two':'Main Street'};
  const {rows,quality}=cleanData([a,b]);
  assert.equal(rows[0].intersection, rows[1].intersection);
  assert.equal(rows[0].injured,null);
  assert.equal(quality.unknownNumeric,2);
});
