import { bench, run } from '~/cli.ts';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const fn = () => {};

bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);
bench('noop', fn);

await run({ percentiles: false });
