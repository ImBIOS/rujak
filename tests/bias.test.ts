/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-empty-function */

import { bench, run } from '~/cli.ts';

bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});
bench('noop', () => {});

await run({ percentiles: false });
