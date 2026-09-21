import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCSV,cleanData,filterRows} from '../js/data.js';
import {aggregateMap,projectBoundaries} from '../js/map.js';
const geo=JSON.parse(readFileSync(new URL('../data/cambridge_neighborhoods.geojson',import.meta.url)));
const {rows}=cleanData(parseCSV(readFileSync(new URL('../data/cambridge_crashes.csv',import.meta.url),'utf8')));
test('official map joins all named neighborhoods and accounts for unmapped crashes',()=>{
 const result=aggregateMap(rows,geo.features);
 assert.equal(result.areas.length,13);assert.equal(result.unmapped.total,3052);
 assert.equal(result.areas.reduce((s,a)=>s+a.total,0)+result.unmapped.total,15508);
 assert.equal(result.areas.find(a=>a.name==='North Cambridge').total,1470);
 assert.equal(result.areas.reduce((s,a)=>s+a.injuries,0)+result.unmapped.injuries,2261);
 assert.equal(result.areas.reduce((s,a)=>s+a.hospitalizations,0)+result.unmapped.hospitalizations,2328);
});
test('filtered and empty selections retain all boundaries without fabricated values',()=>{
 const data=aggregateMap(filterRows(rows,{neighborhood:'North Cambridge',mode:'cyclist',start:'2026-01-01',injury:true,hospital:true}),geo.features);
 assert.equal(data.areas.find(a=>a.name==='North Cambridge').total,2);
 assert.equal(data.areas.filter(a=>a.total>0).length,1);
 assert.ok(aggregateMap([],geo.features).areas.every(a=>a.total===0));
});
test('projection uses real geometry and produces finite paths within the viewbox',()=>{
 const projected=projectBoundaries(geo);
 assert.equal(projected.length,13);
 for(const p of projected){assert.ok(p.path.startsWith('M'));assert.ok(!p.path.includes('NaN'));assert.ok(p.center[0]>0&&p.center[0]<840);assert.ok(p.center[1]>0&&p.center[1]<600);}
});
