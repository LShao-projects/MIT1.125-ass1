import test from 'node:test';
import assert from 'node:assert/strict';
import {isPartialTrendYear} from '../js/charts.js';

const extent={min:'2016-01-02',max:'2026-09-20'};
test('2016 uses a coverage note while 2026 remains partial',()=>{
  const state={start:extent.min,end:extent.max};
  assert.equal(isPartialTrendYear(2016,state,extent),false);
  assert.equal(isPartialTrendYear(2025,state,extent),false);
  assert.equal(isPartialTrendYear(2026,state,extent),true);
  assert.equal(isPartialTrendYear(2016,{start:extent.min,end:'2016-12-31'},extent),false);
});
test('custom date ranges still mark clipped years as partial',()=>{
  assert.equal(isPartialTrendYear(2016,{start:'2016-01-03',end:'2016-12-31'},extent),true);
  assert.equal(isPartialTrendYear(2016,{start:extent.min,end:'2016-06-30'},extent),true);
  assert.equal(isPartialTrendYear(2017,{start:'2017-02-01',end:'2017-12-31'},extent),true);
  assert.equal(isPartialTrendYear(2016,{start:'2016-02-01',end:extent.max},{...extent,min:'2016-02-01'}),true);
});
