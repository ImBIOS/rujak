/* eslint-disable @typescript-eslint/no-empty-function */

import { baseline, bench, group, run } from '~/cli.ts';

bench('noop', () => {});
baseline('aaa', () => {});
bench('noop2', async () => await Promise.resolve(1));

group(() => {
  bench('a', () => {});
  bench('b', () => {});
  bench('e', () => {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw 1;
  });
});

group('group', () => {
  baseline('baseline', () => {});
  bench('Date.now()', () => Date.now());
  bench('performance.now()', () => performance.now());
});

group({ summary: false }, () => {
  bench('aa', () => {});
  bench('bb', () => {});
});

group({ name: 'group2', summary: false }, () => {
  bench('new Array(0)', () => new Array<number>(0));
  bench('new Array(1024)', () => new Array<number>(1024));
});

bench('error', () => {
  throw new Error('error');
});

const _report = await run({
  avg: true, // enable/disable avg column (default: true)
  collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
  colors: true, // enable/disable colors (default: true)
  finalResult: true, // enable/disable final result column (default: true)
  json: false, // enable/disable json output (default: false)
  minMax: true, // enable/disable min/max column (default: true)
  percentiles: false, // enable/disable percentiles column (default: true)
});
