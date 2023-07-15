import { type TableOptions } from '@/table-options.ts';

export function br(options: TableOptions): string {
  const { size, avg = true, minMax = true, percentiles = true } = options;
  return (
    '-'.repeat(size + 14 * Number(avg) + 24 * Number(minMax)) +
    (!percentiles ? '' : ' ' + '-'.repeat(9 + 10 + 10))
  );
}
