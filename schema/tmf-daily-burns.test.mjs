import assert from 'node:assert/strict';
import test from 'node:test';
import { dailyBurnPeriods, dailyActivityPeriods } from '../src/lib/tmf/domain.ts';
import { fetchTmfBurns } from '../src/lib/tmf/api.ts';
const since = new Date('2026-11-01T00:00:00Z');
const through = new Date('2026-11-03T08:40:59Z');
test('daily burns retain zero days and separate actual engine, correction and third-party burns', () => {
 const rows = dailyBurnPeriods([
  { ts:'2026-11-02T00:00:00Z', sky_amount:10, kind:'engine' },
  { ts:'2026-11-02T23:59:59Z', sky_amount:20, kind:'engine' },
  { ts:'2026-11-02T12:00:00Z', sky_amount:400, kind:'supply_correction' },
  { ts:'2026-11-03T01:00:00Z', sky_amount:5, kind:'third_party' },
 ], since, through);
 assert.deepEqual(rows.map(r=>r.sky_burn_engine),[0,30,0]);
 assert.equal(rows[1].sky_burn_protocol,430);
 assert.equal(rows[2].sky_burn_other,5);
 assert.equal(rows[1].burn_events,3);
 assert.ok(rows.every(r=>r.sky_bought===0));
 assert.equal(rows.at(-1).period,'2026-11-03');
});
test('no burn events produces zero days, not missing data',()=>{
 assert.deepEqual(dailyBurnPeriods([],since,through).map(r=>r.sky_burn_engine),[0,0,0]);
});
test('burn fetch validates events and distinguishes empty data from failure',async()=>{
 const original=globalThis.fetch;
 try {
  globalThis.fetch=async(url)=>{
   assert.match(url,/\/v1\/tmf\/burns\?/);assert.match(url,/to=2026-11-03/);
   return {ok:true,json:async()=>({burns:[]})};
  };
  assert.deepEqual(await fetchTmfBurns(since,through),[]);
  for (const row of [
   {ts:'2026-11-02T00:00:00Z',sky_amount:null,kind:'engine'},
   {ts:'bad',sky_amount:'10',kind:'engine'},
   {ts:'2026-11-02T00:00:00Z',sky_amount:'10',kind:'unknown'},
   {ts:'2026-11-04T00:00:00Z',sky_amount:'10',kind:'engine'},
  ]) {
   globalThis.fetch=async()=>({ok:true,json:async()=>({burns:[row]})});
   assert.equal(await fetchTmfBurns(since,through),null);
  }
  globalThis.fetch=async()=>({ok:false,status:503});
  assert.equal(await fetchTmfBurns(since,through),null);
  globalThis.fetch=async()=>({ok:true,json:async()=>({burns:Array(10000).fill({})})});
  assert.equal(await fetchTmfBurns(since,through),null);
  globalThis.fetch=async()=>({ok:true,json:async()=>({burns:[{ts:'2026-11-02T01:00:00+01:00',sky_amount:'42.25',kind:'engine'}]})});
  assert.deepEqual(await fetchTmfBurns(since,through),[{ts:'2026-11-02T00:00:00.000Z',sky_amount:42.25,kind:'engine'}]);
 } finally {globalThis.fetch=original;}
});

test('daily buyback and burn graphs share dates/cutoff; the table retains burn-only days', () => {
 const kick = ts => ({ts, usds_total:6000, usds_buyback:3300, usds_to_stakers:2700, sky_bought:100});
 const burns = [{ts:'2026-11-02T01:00:00Z', sky_amount:42, kind:'engine'}];
 const rows = dailyActivityPeriods([
   kick('2026-10-31T23:59:59Z'), kick('2026-11-01T01:00:00Z'), kick('2026-11-03T09:00:00Z'),
 ], burns, since, through);
 assert.deepEqual(rows.map(r=>r.period),dailyBurnPeriods(burns,since,through).map(r=>r.period));
 assert.deepEqual(rows.map(r=>r.kicks),[1,0,0]);
 assert.deepEqual(rows.map(r=>r.sky_burn_engine),[0,42,0]);
 assert.equal(rows[1].burn_events,1);
 assert.equal(rows[0].usds_buyback,3300);
});
