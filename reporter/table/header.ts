import { type TableOptions } from '@/table-options.ts';

export function header(options: TableOptions): string {
  const { size, avg = true, minMax = true, percentiles = true } = options;
  return (
    'benchmark'.padEnd(size, ' ') +
    (!avg ? '' : 'time (avg)'.padStart(14, ' ')) +
    (!minMax ? '' : '(min … max)'.padStart(24, ' ')) +
    (!percentiles
      ? ''
      : ` ${'p75'.padStart(9, ' ')} ${'p99'.padStart(9, ' ')} ${'p995'.padStart(
          9,
          ' '
        )}`)
  );
}
